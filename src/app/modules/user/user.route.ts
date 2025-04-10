// user.route.ts content

import { Router } from "express";
import { UserController } from "./user.controller";
import auth from "../../middlewares/auth";


const userRouter = Router();
// userRouter.post("/create-user", UserController.createUser);
userRouter.get("/", auth("admin"), UserController.getUser);
// userRouter.get("/:id", auth("user", "admin"), UserController.getSingleUser);
userRouter.get(
  "/by-email",
  auth("user", "admin"),
  UserController.getUserByEmail
);
userRouter.put("/:id", UserController.updateUser);

export default userRouter;