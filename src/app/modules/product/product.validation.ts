import { z } from 'zod';

const positionSchema = z.object({
  x: z.number().optional().default(0),
  y: z.number().optional().default(0.5),
  z: z.number().optional().default(0)
});

const createProductValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: "Product name is required",
    }).min(1, "Product name cannot be empty"),
    description: z.string({
      required_error: "Product description is required",
    }).min(1, "Product description cannot be empty"),
    price: z.number({
      required_error: "Product price is required",
    }).min(0, "Product price cannot be less than 0"),
    stock: z.number({
      required_error: "Product stock is required",
    }).min(0, "Product stock cannot be less than 0"),
    weight: z.number().min(0, "Weight cannot be less than 0").nullable().optional(),
    category: z.string({
      required_error: "Category ID is required",
    }).min(1, "Category ID cannot be empty"),
    brand: z.string({
      required_error: "Brand ID is required",
    }).min(1, "Brand ID cannot be empty"),
    availableColors: z.array(z.string()).min(1, "At least one color is required"),
    specification: z.record(z.any()).optional(),
    keyFeatures: z.array(z.string()).optional(),
    arModel: z.string().url().optional(),
    arScale: z.number().min(0.1).max(10).optional().default(1),
    arPosition: positionSchema.optional(),
    arAvailable: z.boolean().optional().default(false)
  })
});

const updateProductValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Product name cannot be empty").optional(),
    description: z.string().min(1, "Product description cannot be empty").optional(),
    price: z.number().min(0, "Product price cannot be less than 0").optional(),
    stock: z.number().min(0, "Product stock cannot be less than 0").optional(),
    weight: z.number().min(0, "Weight cannot be less than 0").nullable().optional(),
    category: z.string().min(1, "Category ID cannot be empty").optional(),
    brand: z.string().min(1, "Brand ID cannot be empty").optional(),
    availableColors: z.array(z.string()).optional(),
    specification: z.record(z.any()).optional(),
    keyFeatures: z.array(z.string()).optional(),
    arModel: z.string().url().optional().nullable(),
    arScale: z.number().min(0.1).max(10).optional(),
    arPosition: positionSchema.optional(),
    arAvailable: z.boolean().optional()
  })
});

export const productValidation = {
  createProductValidationSchema,
  updateProductValidationSchema
}