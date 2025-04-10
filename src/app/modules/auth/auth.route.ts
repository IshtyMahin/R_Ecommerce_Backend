import { Router } from "express";
import { AuthValidation } from "./auth.validation";
import { AuthControllers } from "./auth.controller";
import { UserValidation } from "../user/user.validation";
import validateRequest from "../../middlewares/validateRequest";

const authRouter = Router();

authRouter.post(
  "/register",
  validateRequest(UserValidation.userValidationSchema),
  AuthControllers.register
);
authRouter.post(
  "/login",
  validateRequest(AuthValidation.loginValidationSchema),
  AuthControllers.login
);
authRouter.post(
  "/forget-password",
  // validateRequest(AuthValidation.forgetPasswordValidationSchema),
  AuthControllers.forgetPassword
);
authRouter.post("/reset-password",
   AuthControllers.resetPassword);
authRouter.post(
  "/refresh-token",
  validateRequest(AuthValidation.refreshTokenValidationSchema),
  AuthControllers.refreshToken
);

export default authRouter;