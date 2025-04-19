import { z } from 'zod';

const createFlashSaleSchema = z.object({
  body:  z.object({
    products: z.array(z.string()).min(1, "At least one product is required"),
  discountPercentage: z.number()
    .min(1, "Discount must be at least 1%")
    .max(99, "Discount cannot exceed 99%")
  })
});

export const FlashSaleValidation = {
  createFlashSaleSchema
};