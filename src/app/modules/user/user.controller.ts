import { Request, Response } from "express";
import { UserService } from "./user.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import catchAsync from "../../utils/catchAsync";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await UserService.createUserIntoDB(payload);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User create successfully",
    data: result,
  });
});
const getUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getUserFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All User get successfully",
    data: result,
  });
});
const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await UserService.getSingleUserFromDB(payload);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User get successfully",
    data: result,
  });
});

const getUserByEmail = catchAsync(async (req: Request, res: Response) => {

  if (req.user && 'email' in req.user) {
    const { email } = req.user;
    const result = await UserService.getUserByEmailFromDB(email);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User fetched successfully",
      data: result,
    });
  } else {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      data: null,
      message: "User email not found",
    });
  }
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const payload = req.body;
  const result = await UserService.updateUserInDB(id, payload);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User update successfully",
    data: result,
  });
});

export const UserController = {
  createUser,
  getUser,
  getSingleUser,
  updateUser,
  getUserByEmail,
};