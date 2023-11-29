import mongoose from "mongoose";
const { Schema, model } = mongoose;
import { FoodModel } from "./food.model.js";
import { UserModel } from "./user.model.js";

// Define a sub-schema for items in the cart
const CartItemSchema = new Schema({
  food: { type: Schema.Types.ObjectId, ref: "food", required: true },

  quantity: { type: Number, required: true },
});

// Define the main Cart Schema
const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // This should match the name of your User model
    required: true,
  },
  foodList: [CartItemSchema],
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  // ... other fields if needed ...
});

export const CartModel = model("Cart", CartSchema);
