import mongoose from "mongoose";
const { Schema, model } = mongoose;

const CartItemSchema = new Schema({
  food: { type: Schema.Types.ObjectId, ref: "food", required: true },

  quantity: { type: Number, required: true },
});

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  foodList: [CartItemSchema],
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
});

export const CartModel = model("Cart", CartSchema);
