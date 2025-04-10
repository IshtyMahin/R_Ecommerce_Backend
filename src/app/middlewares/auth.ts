import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { TUserRole } from "../modules/user/user.interface";
import User from "../modules/user/user.model";
import catchAsync from "../utils/catchAsync";

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
   
    if (!token) {
      throw new Error("You are not authorized!");
    }

    const decoded = jwt.verify(token, "secret") as JwtPayload;

    const { role, email } = decoded;

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("This user is not found !");
    }

    const userStatus = user?.userStatus;

    if (userStatus === "inactive") {
      throw new Error("This user is blocked ! !");
    }
    
    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new Error("You are not authorized");
    }

    req.user = { ...decoded,token,user, userId: user?._id } as JwtPayload;
    
    next();
  });
};

export default auth;