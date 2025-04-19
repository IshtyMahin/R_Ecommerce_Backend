import { Document, Types } from 'mongoose';

export interface IFlashSale extends Document {
  product: Types.ObjectId;
  discountPercentage: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateFlashSaleInput {
  products: string[];
  discountPercentage: number;
}