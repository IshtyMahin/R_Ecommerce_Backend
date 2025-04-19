import { Document, Types } from 'mongoose';

export type DiscountType = 'Percentage' | 'Flat';
export type CouponStatus = 'active' | 'expired' | 'upcoming';

export interface ICoupon extends Document {
   code: string;
   description?: string;
   discountType: DiscountType;
   discountValue: number;
   minOrderAmount?: number;
   maxDiscountAmount?: number;
   startDate: Date;
   endDate: Date;
   isActive: boolean;
   isDeleted?: boolean;
   createdBy: Types.ObjectId;
   updatedBy?: Types.ObjectId;
   createdAt: Date;
   updatedAt: Date;

   status: CouponStatus;
}

export interface IApplyCouponResponse {
   coupon: ICoupon;
   discountedPrice: number;
   discountAmount: number;
   originalAmount: number;
}