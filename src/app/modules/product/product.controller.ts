import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { ProductService } from "./product.service";
import { IImageFiles } from "../../interface/IImageFile";
import sendResponse from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.createProduct(
    req.body,
    req.files as IImageFiles
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product created successfully",
    data: result,
  });
});

const getAllProduct = catchAsync(async (req, res) => {
  const result = await ProductService.getAllProduct(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Products are retrieved successfully",
    meta: result.meta,
    data: result.result,
  });
});

const getTrendingProducts = catchAsync(async (req, res) => {
  const { limit } = req.query;
  const result = await ProductService.getTrendingProducts(Number(limit));

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Products are retrieved successfully",
    data: result,
  });
});

const getSingleProduct = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const result = await ProductService.getSingleProduct(productId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product retrieved successfully",
    data: result,
  });
});

const updateProduct = catchAsync(async (req, res) => {
  const {
    body: payload,
    params: { productId },
  } = req;

  const result = await ProductService.updateProduct(
    productId,
    payload,
    req.files as IImageFiles
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product updated successfully",
    data: result,
  });
});

const deleteProduct = catchAsync(async (req, res) => {
  const {
    params: { productId },
  } = req;

  const result = await ProductService.deleteProduct(productId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product deleted successfully",
    data: result,
  });
});

const getAREnabledProducts = catchAsync(async (req, res) => {
  const result = await ProductService.getAREnabledProducts();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "AR-enabled products retrieved successfully",
    data: result,
  });
});

export const ProductController = {
  createProduct,
  getAllProduct,
  getTrendingProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getAREnabledProducts
};