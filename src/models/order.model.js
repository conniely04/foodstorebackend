import { model, Schema } from "mongoose";
import { OrderStatus } from "../constants/orderStatus.js";

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
    email: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    zip: { type: Number, required: true },
    cardname: { type: String, required: true },

    paymentId: { type: Number, required: true },
    cvv: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    phone: { type: String, required: true },
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
    this.user = new mongoose.Types.ObjectId(this.user);
  }
  next();
});

export const OrderModel = model("order", orderSchema);
