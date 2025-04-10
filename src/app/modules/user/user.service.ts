
import { TUser } from "./user.interface";
import User from "./user.model";

const createUserIntoDB = async (payload: TUser) => {
  const result = await User.create(payload);
  return result;
};
const getUserFromDB = async () => {
  const result = await User.find();
  return result;
};
const getSingleUserFromDB = async (id: string) => {
  const result = await User.findById(id);
  return result;
};
const getUserByEmailFromDB = async (email: string) => {
  const result = await User.findOne({ email }).select("-password"); 
  return result;
};
const updateUserInDB = async (id: string, payload: Partial<TUser>) => {
  const result = await User.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

export const UserService = {
  createUserIntoDB,
  getUserFromDB,
  getSingleUserFromDB,
  updateUserInDB,
  getUserByEmailFromDB,
};