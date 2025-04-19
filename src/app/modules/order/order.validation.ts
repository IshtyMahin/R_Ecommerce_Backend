// order.validation.ts
import { z } from 'zod';

const orderProductSchema = z.object({
  product: z.string({ required_error: "Product ID is required" }),
  quantity: z.number({ required_error: "Quantity is required" }).min(1),
  color: z.string({ required_error: "Color is required" }),
});

export const orderValidation = {
  create:  z.object({
    body: z.object({
      products: z.array(orderProductSchema).min(1, "At least one product is required"),
      coupon: z.string().optional(),
      shippingAddress: z.string({ required_error: "Shipping address is required" }),
      paymentMethod: z.enum(['COD', 'Online'], {
        required_error: "Payment method must be either 'COD' or 'Online'"
      }),
    })
  }),
  updateStatus: z.object({
    status: z.enum(['Pending', 'Processing', 'Completed', 'Cancelled']),
  }),
};