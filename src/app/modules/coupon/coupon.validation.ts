import { z } from 'zod';

const commonCouponFields = {
   code: z.string().min(3).max(20),
   description: z.string().optional(),
   discountType: z.enum(['Percentage', 'Flat']),
   discountValue: z.number().min(1),
   minOrderAmount: z.number().min(0).optional(),
   maxDiscountAmount: z.number().min(0).optional(),
   startDate: z.string().datetime(),
   endDate: z.string().datetime(),
   isActive: z.boolean().optional().default(true)
};

export const createCouponValidationSchema = z.object({
   body: z.object(commonCouponFields)
});

export const updateCouponValidationSchema = z.object({
   body: z.object({
      ...commonCouponFields,
      isActive: z.boolean().optional()
   }).partial()
});

export const applyCouponValidationSchema = z.object({
   body: z.object({
      orderAmount: z.number().min(0)
   })
});

export const CouponValidation = {
   createCouponValidationSchema,
   updateCouponValidationSchema,
   applyCouponValidationSchema
};