import { z } from "zod";

const userValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: "Name is required",
    }),
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Please provide a valid email address"),
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(6, "Password must be at least 6 characters long"),
    role: z
      .enum(["user", "admin"], {
        errorMap: () => ({ message: "Role must be either 'user' or 'admin'" }),
      })
      .default("user"),
    userStatus: z.enum(["active", "inactive"]).default("active"),
    address: z.string(),
    phone: z.string(),
    city: z.string(),
  }),
});

export const UserValidation = {
  userValidationSchema,
};