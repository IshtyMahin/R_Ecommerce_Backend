import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/appError';
import { IProduct } from './product.interface';
import { Category } from '../category/category.model';
import { Product } from './product.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { Order } from '../order/order.model';
import { Review } from '../review/review.model';
import { FlashSale } from '../flashSell/flashSale.model';
import { Express } from 'express';

export interface IImageFiles {
  images?: Express.Multer.File[];
  arModel?: Express.Multer.File[];
}

const createProduct = async (
  productData: Partial<IProduct>,
  productFiles: IImageFiles
) => {
  const { images, arModel } = productFiles;
  
  if (!images || images.length === 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Product images are required.'
    );
  }

  productData.imageUrls = images.map((image) => image.path);

  // Handle AR model upload
  if (arModel && arModel.length > 0) {
    productData.arModel = arModel[0].path;
    productData.arAvailable = true;
  }

  const isCategoryExists = await Category.findById(productData.category);
  if (!isCategoryExists) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Category does not exist!');
  }

  if (!isCategoryExists.isActive) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Category is not active!');
  }

  const newProduct = new Product(productData);
  const result = await newProduct.save();
  return result;
};

const getAllProduct = async (query: Record<string, unknown>) => {
  const {
    minPrice,
    maxPrice,
    categories,
    brands,
    inStock,
    ratings,
    ...pQuery
  } = query;

  const filter: Record<string, any> = {};

  if (categories) {
    const categoryArray = typeof categories === 'string'
      ? categories.split(',')
      : Array.isArray(categories)
        ? categories
        : [categories];
    filter.category = { $in: categoryArray };
  }

  if (brands) {
    const brandArray = typeof brands === 'string'
      ? brands.split(',')
      : Array.isArray(brands)
        ? brands
        : [brands];
    filter.brand = { $in: brandArray };
  }

  if (inStock !== undefined) {
    filter.stock = inStock === 'true' ? { $gt: 0 } : 0;
  }

  if (ratings) {
    const ratingArray = typeof ratings === 'string'
      ? ratings.split(',')
      : Array.isArray(ratings) ? ratings : [ratings];
    filter.averageRating = { $in: ratingArray.map(Number) };
  }

  const productQuery = new QueryBuilder(
    Product.find(filter)
      .populate('category', 'name')
      .populate('brand', 'name'),
    pQuery
  )
    .search(['name', 'description'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .priceRange(Number(minPrice) || 0, Number(maxPrice) || Infinity);

  const products = await productQuery.modelQuery.lean();
  const meta = await productQuery.countTotal();

  const productIds = products.map((product: any) => product._id);

  const flashSales = await FlashSale.find({
    product: { $in: productIds },
    discountPercentage: { $gt: 0 },
  }).select('product discountPercentage');

  const flashSaleMap = flashSales.reduce((acc, { product, discountPercentage }) => {
    acc[product.toString()] = discountPercentage;
    return acc;
  }, {} as Record<string, number>);

  const updatedProducts = products.map((product: any) => {
    const discountPercentage = flashSaleMap[product._id.toString()];
    if (discountPercentage) {
      product.offerPrice = product.price * (1 - discountPercentage / 100);
    } else {
      product.offerPrice = null;
    }
    return product;
  });

  return {
    meta,
    result: updatedProducts,
  };
};

const getTrendingProducts = async (limit: number) => {
  const now = new Date();
  const last30Days = new Date(now.setDate(now.getDate() - 30));

  const trendingProducts = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: last30Days },
      },
    },
    {
      $unwind: '$products',
    },
    {
      $group: {
        _id: '$products.product',
        orderCount: { $sum: '$products.quantity' },
      },
    },
    {
      $sort: { orderCount: -1 },
    },
    {
      $limit: limit || 10,
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    {
      $unwind: '$productDetails',
    },
    {
      $project: {
        _id: 0,
        productId: '$_id',
        orderCount: 1,
        name: '$productDetails.name',
        price: '$productDetails.price',
        offer: '$productDetails.offer',
        imageUrls: '$productDetails.imageUrls',
      },
    },
  ]);

  return trendingProducts;
};

const getSingleProduct = async (productId: string) => {
  const product = await Product.findById(productId)
    .populate("brand category");

  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  if (!product.isActive) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Product is not active');
  }

  const offerPrice = await product.calculateOfferPrice();
  const reviews = await Review.find({ product: product._id });

  const productObj = product.toObject();

  return {
    ...productObj,
    offerPrice,
    reviews
  };
};

const updateProduct = async (
  productId: string,
  payload: Partial<IProduct>,
  productFiles: IImageFiles
) => {
  const { images, arModel } = productFiles;

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product Not Found');
  }

  if (images && images.length > 0) {
    payload.imageUrls = images.map((image) => image.path);
  }

  // Handle AR model update
  if (arModel && arModel.length > 0) {
    payload.arModel = arModel[0].path;
    payload.arAvailable = true;
  } else if (payload.arModel === null) {
    // Handle AR model removal
    payload.arModel = undefined;
    payload.arAvailable = false;
  }

  return await Product.findByIdAndUpdate(productId, payload, { new: true });
};

const deleteProduct = async (productId: string) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product Not Found');
  }

  return await Product.findByIdAndDelete(productId);
};

// Add new method for AR-enabled products
const getAREnabledProducts = async () => {
  return await Product.find({ arAvailable: true })
    .select('name imageUrls arModel arScale arPosition')
    .lean();
};

export const ProductService = {
  createProduct,
  getAllProduct,
  getTrendingProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getAREnabledProducts
};