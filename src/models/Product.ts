import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: { en: string; ar: string };
  slug: string;
  description: { en: string; ar: string };
  shortDescription?: { en: string; ar: string };
  price: number;
  compareAtPrice?: number;
  sku: string;
  barcode?: string;
  brand: string;
  category: mongoose.Types.ObjectId;
  images: string[];
  thumbnail: string;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  isFeatured: boolean;
  isPrescriptionRequired: boolean;
  tags: string[];
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  ingredients?: string;
  dosage?: string;
  sideEffects?: string;
  averageRating: number;
  reviewCount: number;
  soldCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    slug: { type: String, required: true, unique: true },
    description: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    shortDescription: {
      en: { type: String },
      ar: { type: String },
    },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    sku: { type: String, required: true, unique: true },
    barcode: { type: String },
    brand: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ type: String }],
    thumbnail: { type: String, required: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isPrescriptionRequired: { type: Boolean, default: false },
    tags: [{ type: String }],
    weight: { type: Number },
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
    },
    ingredients: { type: String },
    dosage: { type: String },
    sideEffects: { type: String },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProductSchema.index({ slug: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ 'name.en': 'text', 'name.ar': 'text', 'description.en': 'text', tags: 'text' });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
