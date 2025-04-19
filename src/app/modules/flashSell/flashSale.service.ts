import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { IJwtPayload } from "../auth/auth.interface";
import { ICreateFlashSaleInput, IFlashSale } from "./flashSale.interface";
import { FlashSale } from "./flashSale.model";
import User from "../user/user.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { Product } from "../product/product.model";

const createFlashSale = async (
  flashSaleData: ICreateFlashSaleInput,
  authUser: IJwtPayload
) => {
  // Only allow admin to create flash sales
  const user = await User.findById(authUser.userId);
  if (!user || user.role !== 'admin') {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You don't have permission to create flash sales"
    );
  }

  const { products, discountPercentage } = flashSaleData;

  // Validate products exist and are active
  const productCheck = await Product.find({
    _id: { $in: products },
    isActive: true
  });

  if (productCheck.length !== products.length) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Some products are invalid or inactive"
    );
  }

  // Create or update flash sales
  const operations = products.map((productId) => ({
    updateOne: {
      filter: { product: productId },
      update: {
        $set: {
          discountPercentage,
          createdBy: authUser.userId,
          updatedAt: new Date()
        }
      },
      upsert: true
    }
  }));

  const result = await FlashSale.bulkWrite(operations);
  return result;
};

const getActiveFlashSales = async (query: Record<string, unknown>) => {
  const flashSaleQuery = new QueryBuilder(
    FlashSale.find()
      .populate({
        path: 'product',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'brand', select: 'name' }
        ]
      }),
    query
  )
    .filter()
    .sort()
    .paginate();

  const flashSales = await flashSaleQuery.modelQuery.lean();

  const productsWithOffers = flashSales.map((flashSale: any) => {
    if (!flashSale.product) return null;
    
    const product = {
      ...flashSale.product,
      offerPrice: flashSale.product.price * (1 - flashSale.discountPercentage / 100),
      discountPercentage: flashSale.discountPercentage
    };
    
    return product;
  }).filter(Boolean); 

  const meta = await flashSaleQuery.countTotal();

  return {
    meta,
    result: productsWithOffers
  };
};

export const FlashSaleService = {
  createFlashSale,
  getActiveFlashSales
};