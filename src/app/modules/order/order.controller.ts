import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { OrderService } from "./order.service";
import { IJwtPayload } from "../auth/auth.interface";
import sendResponse from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.createOrder(
    req.body,
    req.user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Order created successfully",
    data: result,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getAllOrders(
    req.query,
    req.user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Orders retrieved successfully",
    data: result.result,
    meta: result.meta,
  });
});

const getOrderDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getOrderDetails(
    req.params.orderId,
    req.user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order retrieved successfully",
    data: result,
  });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getMyOrders(
    req.query,
    req.user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Orders retrieved successfully",
    data: result.result,
    meta: result.meta,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.updateOrderStatus(
    req.params.orderId,
    req.body.status,
    req.user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order status updated successfully",
    data: result,
  });
});
const checkIfPurchased = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const user = req.user as IJwtPayload;

  const hasPurchased = await OrderService.hasUserPurchasedProduct(productId, user.userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: hasPurchased ? "Product purchased" : "Product not purchased",
    data: { hasPurchased },
  });
});

export const OrderController = {
  createOrder,
  getAllOrders,
  getOrderDetails,
  getMyOrders,
  updateOrderStatus,
  checkIfPurchased
};