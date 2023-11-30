import { model, Schema } from "mongoose";
import { OrderStatus } from "../constants/orderStatus.js";
import { FoodModel } from "./food.model.js";
import { CartModel } from "./cart.model.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

const OrderItemSchema = new Schema({
  food: { type: Schema.Types.ObjectId, ref: "food", required: true },
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },

    paymentId: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    items: [OrderItemSchema],
    status: { type: String, default: OrderStatus.NEW },
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

orderSchema.pre("save", async function (next) {
  if (this.isModified("user") && !mongoose.Types.ObjectId.isValid(this.user)) {
    // Convert the user ID to ObjectId only if it's a valid ObjectId string
    this.user = new mongoose.Types.ObjectId(this.user);
  }
  next();
});

export const OrderModel = model("order", orderSchema);
