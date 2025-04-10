import config from "../../config";
import sendMail from "../../utils/sendEmail";
import { TUser } from "../user/user.interface";
import User from "../user/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const register = async (payload: TUser) => {
  const result = await User.create(payload);
  return result;
};

const login = async (payload: { email: string; password: string }) => {
  const user = await User.findOne({ email: payload?.email }).select(
    "+password"
  );

  if (!user) {
    throw new Error("This user is not found !");
  }

  const userStatus = user?.userStatus;

  if (userStatus === "inactive") {
    throw new Error("This user is blocked ! !");
  }

  const isPasswordMatched = await bcrypt.compare(
    payload?.password,
    user?.password
  );

  if (!isPasswordMatched) {
    throw new Error("Wrong Password!!! Tell me who are you? 😈");
  }

  const jwtPayload = {
    email: user?.email,
    role: user?.role,
  };

  const accessToken = jwt.sign(jwtPayload, "secret", { expiresIn: "1h" });
  const refreshToken = jwt.sign(jwtPayload, "refreshSecret", { expiresIn: "7d" });

  return { accessToken, refreshToken, user };
};

const forgetPassword = async (payload: { email: string }) => {
  const user = await User.findOne({
    email: payload.email,
  });

  if (!user) {
    throw new Error("User not found!");
  }

  if (user?.userStatus === "inactive") {
    throw new Error("User is blocked!");
  }

  const jwtPayload = {
    email: user?.email,
    role: user?.role,
  };

  const token = jwt.sign(jwtPayload, "secret", { expiresIn: "1h" });

  const resetLink = `${config.website_url}/?email=${user.email}&token=${token}`;

  await sendMail(user?.email, "Reset password link", resetLink);
};

const resetPassword = async (payload: {
  email: string;
  token: string;
  password: string;
}) => {
  const user = await User.findOne({ email: payload.email });

  if (!user) {
    throw new Error("User not found!");
  }

  if (user?.userStatus === "inactive") {
    throw new Error("User is blocked!");
  }

  // Verify the token
  jwt.verify(payload.token, "secret", (err) => {
    if (err) {
      throw new Error("Invalid or expired token");
    }
  });

  // Hash the new password
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );

  // Update the user's password
  user.password = hashedPassword;

  const result = await User.findByIdAndUpdate(user._id, user, { new: true });

  return result;
};

const refreshToken = async (payload: { refreshToken: string }) => {
  const { refreshToken } = payload;

  const decoded = jwt.verify(refreshToken, "refreshSecret") as { email: string; role: string };

  if (!decoded) {
    throw new Error("Invalid refresh token");
  }

  const user = await User.findOne({ email: decoded.email });

  if (!user) {
    throw new Error("User not found!");
  }

  const jwtPayload = {
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(jwtPayload, "secret", { expiresIn: "1h" });

  return { accessToken };
};

export const AuthService = {
  register,
  login,
  forgetPassword,
  resetPassword,
  refreshToken,
};