import mongoose, { Types } from "mongoose";
import { IJwtPayload } from "../auth/auth.interface";
import { Coupon } from "../coupon/coupon.model";
import { IOrder } from "./order.interface";
import { Order } from "./order.model";
import { Product } from "../product/product.model";
import { Payment } from "../payment/payment.model";
import { generateTransactionId } from "../payment/payment.utils";
import { sslService } from "../sslcommerz/sslcommerz.service";
import User from "../user/user.model";
import AppError from "../../errors/appError";
import { StatusCodes } from "http-status-codes";
import QueryBuilder from "../../builder/QueryBuilder";
import { log } from "handlebars";

// order.service.ts
const createOrder = async (
  orderData: Partial<IOrder>,
  authUser: IJwtPayload
) => {

  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate products
    if (!orderData.products || orderData.products.length === 0) {
      throw new AppError(StatusCodes.BAD_REQUEST, "No products in order");
    }

    // Create order
    const order = new Order({
      ...orderData,
      user: authUser.userId,
      paymentStatus: orderData.paymentMethod === "COD" ? "Pending" : "Pending",
    });

    const createdOrder = await order.save({ session });
    await createdOrder.populate("user products.product");

    // Create payment record
    const transactionId = generateTransactionId();
    const payment = new Payment({
      user: authUser.userId,
      order: createdOrder._id,
      method: orderData.paymentMethod,
      transactionId,
      amount: createdOrder.finalAmount,
      status: "Pending",
    });

    await payment.save({ session });

    // Handle payment method
    let result;
    if (createdOrder.paymentMethod === "Online") {
      const paymentData = await sslService.initPayment({
        total_amount: createdOrder.finalAmount,
        tran_id: transactionId,
        
      });
      console.log(paymentData, "paymentData");
      result = { 
        success: true,
        message: "Payment initiated",
        data: {
          orderId: createdOrder._id,
          paymentUrl: paymentData
        }
      };
    } else {
      result = {
        success: true,
        message: "Order placed successfully",
        data: {
          orderId: createdOrder._id
        }
      };
    }
    console.log(result, "result");
    
    await session.commitTransaction();
    return result;

  } catch (error) {
    await session.abortTransaction();
    console.error("Order creation error:", error);
    throw error;
  } finally {
    session.endSession();
  }
};
const getAllOrders = async (
  query: Record<string, unknown>,
  authUser: IJwtPayload
) => {
  const user = await User.findById(authUser.userId);
  if (!user || user.role !== 'admin') {
    throw new AppError(StatusCodes.FORBIDDEN, "Unauthorized access");
  }

  const orderQuery = new QueryBuilder(
    Order.find().populate("user products.product coupon"),
    query
  )
    .search(["user.name", "user.email", "products.product.name"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();

  return { meta, result };
};

const getOrderDetails = async (orderId: string, authUser: IJwtPayload) => {
  const order = await Order.findById(orderId)
    .populate("user products.product coupon");

  if (!order) {
    throw new AppError(StatusCodes.NOT_FOUND, "Order not found");
  }

  const user = await User.findById(authUser.userId);
  if (user?.role !== 'admin' && !order.user._id.equals(authUser.userId)) {
    throw new AppError(StatusCodes.FORBIDDEN, "Unauthorized access");
  }

  order.payment = await Payment.findOne({ order: order._id });
  return order;
};

const getMyOrders = async (
  query: Record<string, unknown>,
  authUser: IJwtPayload
) => {
  const orderQuery = new QueryBuilder(
    Order.find({ user: authUser.userId }).populate("products.product coupon"),
    query
  )
    .search(["products.product.name"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();

  return { meta, result };
};

const updateOrderStatus = async (
  orderId: string,
  status: string,
  authUser: IJwtPayload
) => {
  const user = await User.findById(authUser.userId);
  if (!user || user.role !== 'admin') {
    throw new AppError(StatusCodes.FORBIDDEN, "Unauthorized access");
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  ).populate("user products.product");

  if (!order) {
    throw new AppError(StatusCodes.NOT_FOUND, "Order not found");
  }

  return order;
};

const hasUserPurchasedProduct = async (productId: string, userId: string) => {
  const order = await Order.findOne({
    user: userId,
    'products.product': productId,
    // status: { $in: ['Delivered', 'Completed'] } // Optional filter
  });

  return !!order;
};


export const OrderService = {
  createOrder,
  getAllOrders,
  getOrderDetails,
  getMyOrders,
  updateOrderStatus,
  hasUserPurchasedProduct,
};