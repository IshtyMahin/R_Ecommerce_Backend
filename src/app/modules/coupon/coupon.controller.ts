import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { CouponService } from './coupon.service';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { IJwtPayload } from '../auth/auth.interface';

const createCoupon = catchAsync(async (req: Request, res: Response) => {
   const result = await CouponService.createCoupon(
      req.body, 
      req.user as IJwtPayload
   );

   sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'Coupon created successfully',
      data: result,
   });
});

const getAllCoupons = catchAsync(async (req: Request, res: Response) => {
   const result = await CouponService.getAllCoupons(req.query);

   sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Coupons retrieved successfully',
      meta: result.meta,
      data: result.result,
   });
});

const updateCoupon = catchAsync(async (req: Request, res: Response) => {
   const { couponCode } = req.params;
   const result = await CouponService.updateCoupon(
      req.body, 
      couponCode,
      req.user as IJwtPayload
   );

   sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Coupon updated successfully',
      data: result,
   });
});

const applyCoupon = catchAsync(async (req: Request, res: Response) => {
   const { couponCode } = req.params;
   const { orderAmount } = req.body;

   const result = await CouponService.getCouponByCode(
      orderAmount, 
      couponCode
   );

   sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Coupon applied successfully',
      data: result,
   });
});

const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
   const { couponId } = req.params;
   const result = await CouponService.deleteCoupon(
      couponId,
      req.user as IJwtPayload
   );

   sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: result.message,
      data: null,
   });
});

export const couponController = {
   createCoupon,
   getAllCoupons,
   updateCoupon,
   applyCoupon, 
   deleteCoupon,
};