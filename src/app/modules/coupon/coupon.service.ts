import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/appError';
import { ICoupon } from './coupon.interface';
import { Coupon } from './coupon.model';
import { calculateDiscount } from './coupon.utils';
import { IJwtPayload } from '../auth/auth.interface';
import User from '../user/user.model';

const createCoupon = async (couponData: Partial<ICoupon>, authUser: IJwtPayload) => {
   const user = await User.findById(authUser.userId);
   if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
   }

   if (user.role !== 'admin') {
      throw new AppError(
         StatusCodes.FORBIDDEN,
         'Only admins can create coupons'
      );
   }

   const coupon = new Coupon({
      ...couponData,
      createdBy: authUser.userId
   });
   return await coupon.save();
};

const getAllCoupons = async (query: Record<string, unknown>) => {
   const couponQuery = new QueryBuilder(Coupon.find(), query)
      .search(['code', 'description'])
      .filter()
      .sort()
      .paginate()
      .fields();

   const result = await couponQuery.modelQuery;
   const meta = await couponQuery.countTotal();

   return {
      meta,
      result,
   };
};

const updateCoupon = async (payload: Partial<ICoupon>, couponCode: string, authUser: IJwtPayload) => {
   const user = await User.findById(authUser.userId);
   if (!user || user.role !== 'admin') {
      throw new AppError(StatusCodes.FORBIDDEN, 'Only admins can update coupons');
   }

   const currentDate = new Date();
   const coupon = await Coupon.findOne({ code: couponCode });

   if (!coupon) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Coupon not found.');
   }

   if (coupon.endDate < currentDate) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Coupon has expired.');
   }

   const updatedCoupon = await Coupon.findByIdAndUpdate(
      coupon._id,
      { $set: { ...payload, updatedBy: authUser.userId } },
      { new: true, runValidators: true }
   );

   return updatedCoupon;
};

const getCouponByCode = async (orderAmount: number, couponCode: string) => {
   const currentDate = new Date();
   const coupon = await Coupon.findOne({ code: couponCode });

   if (!coupon) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Coupon not found.');
   }

   if (!coupon.isActive) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Coupon is inactive.');
   }

   if (coupon.endDate < currentDate) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Coupon has expired.');
   }

   if (coupon.startDate > currentDate) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Coupon has not started.');
   }

   if (orderAmount < (coupon.minOrderAmount ?? 0)) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Order amount is below the minimum required');
   }

   const discountAmount = calculateDiscount(coupon, orderAmount);
   const discountedPrice = orderAmount - discountAmount;

   return { 
      coupon, 
      discountedPrice, 
      discountAmount,
      originalAmount: orderAmount
   };
};

const deleteCoupon = async (couponId: string, authUser: IJwtPayload) => {
   const user = await User.findById(authUser.userId);
   if (!user || user.role !== 'admin') {
      throw new AppError(StatusCodes.FORBIDDEN, 'Only admins can delete coupons');
   }

   const coupon = await Coupon.findById(couponId);
   if (!coupon) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Coupon not found.');
   }

   await Coupon.findByIdAndUpdate(coupon._id, { 
      isActive: false,
      isDeleted: true,
      updatedBy: authUser.userId
   });

   return { message: 'Coupon deactivated and marked as deleted successfully.' };
};

export const CouponService = {
   createCoupon,
   getAllCoupons,
   updateCoupon,
   getCouponByCode,
   deleteCoupon,
};