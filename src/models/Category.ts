import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: { en: string; ar: string };
  slug: string;
  description?: { en: string; ar: string };
  image?: string;
  icon?: string;
  parent?: mongoose.Types.ObjectId;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    slug: { type: String, required: true, unique: true },
    description: {
      en: { type: String },
      ar: { type: String },
    },
    image: { type: String },
    icon: { type: String },
    parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CategorySchema.index({ slug: 1 });

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
export default Category;
