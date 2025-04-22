import { Schema, model, Document, Types } from 'mongoose';
import { IProduct } from './product.interface';
import { FlashSale } from '../flashSell/flashSale.model';

const productSchema = new Schema<IProduct>(
   {
      name: {
         type: String,
         required: [true, 'Product name is required'],
         unique: true,
         trim: true,
      },
      slug: {
         type: String,
         required: [true, 'Product slug is required'],
         unique: true,
         trim: true,
      },
      description: {
         type: String,
         required: [true, 'Product description is required'],
         trim: true,
      },
      price: {
         type: Number,
         required: [true, 'Product price is required'],
         min: 0,
      },
      stock: {
         type: Number,
         required: [true, 'Product stock is required'],
         min: 0,
      },
      weight: {
         type: Number,
         min: 0,
         default: null,
      },
      category: {
         type: Schema.Types.ObjectId,
         ref: 'Category',
         required: [true, 'Category is required'],
      },
      imageUrls: {
         type: [String],
         required: [true, 'Product images are required'],
      },
      isActive: {
         type: Boolean,
         default: true,
      },
      brand: {
         type: Schema.Types.ObjectId,
         ref: 'Brand',
         required: [true, 'Brand of product is required'],
      },
      averageRating: {
         type: Number,
         default: 0,
         min: 0,
         max: 5,
      },
      ratingCount: {
         type: Number,
         default: 0,
         min: 0,
      },
      availableColors: {
         type: [String],
         required: [true, 'Available colors are required'],
      },
      specification: {
         type: Schema.Types.Mixed,
         default: {},
      },
      keyFeatures: {
         type: [String],
         default: [],
      },
      arModel: {
         type: String,
         default: null
      },
      arScale: {
         type: Number,
         default: 1,
         min: 0.1,
         max: 10
      },
      arPosition: {
         x: { type: Number, default: 0 },
         y: { type: Number, default: 0.5 },
         z: { type: Number, default: 0 }
      },
      arAvailable: {
         type: Boolean,
         default: false
      }
   },
   {
      timestamps: true,
   }
);

productSchema.pre<IProduct>('validate', function (next) {
   if (this.isModified('name') && !this.slug) {
      this.slug = this.name
         .toLowerCase()
         .replace(/ /g, '-')
         .replace(/[^\w-]+/g, '');
   }
   next();
});

productSchema.methods.calculateOfferPrice = async function () {
   const flashSale = await FlashSale.findOne({ product: this._id });

   if (flashSale) {
      const discount = (flashSale.discountPercentage / 100) * this.price;
      return this.price - discount;
   }

   return null;
};

export const Product = model<IProduct>('Product', productSchema);