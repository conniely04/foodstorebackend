import { model, Schema } from "mongoose";

export const FoodSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    inStock: { type: Boolean, default: false },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
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

export const FoodModel = model("food", FoodSchema);
