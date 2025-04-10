import { NextFunction, Request, Response,RequestHandler } from "express";
import httpStatus from "http-status-codes";

const notFound: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API Not Found !!",
    error: "",
  });
  return next();
};

export default notFound;