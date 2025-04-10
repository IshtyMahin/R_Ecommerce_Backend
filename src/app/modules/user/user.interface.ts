
import { USER_ROLE } from "./user.constant";


export type TUser = {
  _id: string;
  name: string;
  email: string;
  password: string;
  address: string;
  phone: string;
  city: string;
  role: TUserRole;
  userStatus: "active" | "inactive";
};

export type TUserRole = keyof typeof USER_ROLE;