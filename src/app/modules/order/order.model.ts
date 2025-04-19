import { Schema, Types, model } from "mongoose";
import { IOrder } from "./order.interface";
import { Product } from "../product/product.model";
import { Coupon } from "../coupon/coupon.model";
import AppError from "../../errors/appError";
import { StatusCodes } from "http-status-codes";

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        color: {
          type: String,
          required: true,
        },
      },
    ],
    coupon: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Cancelled"],
      default: "Pending",
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "Online"],
      default: "Online",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("validate", async function (next) {
  const order = this;

  let totalAmount = 0;
  let finalDiscount = 0;

  for (let item of order.products) {
    const product = await Product.findById(item.product);
    if (!product) {
      return next(new AppError(StatusCodes.NOT_FOUND, "Product not found!"));
    }

    if (product.isActive === false) {
      return next(new AppError(StatusCodes.BAD_REQUEST, `Product ${product.name} is inactive`));
    }

    const offerPrice = (await product.calculateOfferPrice()) || 0;
    let productPrice = offerPrice || product.price;
    item.unitPrice = productPrice;
    totalAmount += productPrice * item.quantity;
  }

  if (order.coupon) {
    const couponDetails = await Coupon.findById(order.coupon);
    if (couponDetails && couponDetails.isActive) {
      if (totalAmount >= (couponDetails.minOrderAmount ?? 0)) {
        if (couponDetails.discountType === "Percentage") {
          finalDiscount = Math.min(
            (couponDetails.discountValue / 100) * totalAmount,
            couponDetails.maxDiscountAmount || Infinity
          );
        } else {
          finalDiscount = Math.min(couponDetails.discountValue, totalAmount);
        }
      }
    }
  }

  const isDhaka = order.shippingAddress.toLowerCase().includes("dhaka");
  const deliveryCharge = isDhaka ? 60 : 120;

  order.totalAmount = totalAmount;
  order.discount = finalDiscount;
  order.deliveryCharge = deliveryCharge;
  order.finalAmount = totalAmount - finalDiscount + deliveryCharge;

  next();
});

export const Order = model<IOrder>("Order", orderSchema);