import { StatusCodes } from 'http-status-codes';
import { IReview } from './review.interface';
import { Review } from './review.model';
import { JwtPayload } from 'jsonwebtoken';
import AppError from '../../errors/appError';
import QueryBuilder from '../../builder/QueryBuilder';
import mongoose from 'mongoose';
import { Product } from '../product/product.model';

const createReview = async (payload: IReview, user: JwtPayload) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const userId = user.userId;

    const existingReview = await Review.findOne(
      { user: userId, product: payload.product },
      null,
      { session }
    );

    if (existingReview) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'You have already reviewed this product.'
      );
    }

    const [newReview] = await Review.create([{ ...payload, user: userId }], { session });

    if (!newReview) {
      throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create review.');
    }

    const stats = await Review.aggregate([
      { $match: { product: newReview.product } },
      {
        $group: {
          _id: '$product',
          averageRating: { $avg: '$rating' },
          ratingCount: { $sum: 1 },
        },
      },
    ]);

    const { averageRating = 0, ratingCount = 0 } = stats[0] || {};

    // Update product with new stats
    const updatedProduct = await Product.findByIdAndUpdate(
      payload.product,
      { averageRating, ratingCount },
      { session, new: true }
    );
   
    if (!updatedProduct) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Product not found during update.');
    }

    await session.commitTransaction();
    return newReview;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};


const getAllReviews = async (query: Record<string, unknown>) => {
   const brandQuery = new QueryBuilder(
      Review.find().populate('product user'),
      query
   )
      .search(['review'])
      .filter()
      .sort()
      .paginate()
      .fields();

   const result = await brandQuery.modelQuery;
   const meta = await brandQuery.countTotal();

   console.log(result,meta);
   

   return {
      meta,
      result,
   };
};

export const ReviewServices = {
   createReview,
   getAllReviews,
};
