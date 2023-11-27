import { model, Schema } from "mongoose";

export const CategorySchema = new Schema({
  name: {type: String,required: true},
  image: { type: String, required: true },
  active: { type: Boolean, default: true },
},
{
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
);

export const CategoryModel = model("category", CategorySchema);
