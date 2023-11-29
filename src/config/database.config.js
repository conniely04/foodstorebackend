import mongoose, { set } from "mongoose";

import { UserModel } from "../models/user.model.js";
import { CategoryModel } from "../models/category.model.js";
import { FoodModel } from "../models/food.model.js";
import { CartModel } from "../models/cart.model.js";
import { sample_users } from "../data.js";
import bcrypt from "bcryptjs";
const PASSWORD_HASH = 10;
set("strictQuery", true);

mongoose.set("strictQuery", true);

//you can connect your own mongoURI (make sure to put in your.env file)

export const dbconnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {});
    await addUsers();
    await addCategories();
    await addFood();
    await addCart();
    console.log("connected successfully");
  } catch (error) {
    console.error("Connection error:", error);
  }
};

async function addUsers() {
  const userCount = await UserModel.countDocuments();
  if (userCount > 0) {
    console.log("User is already added");
    return;
  }

  //hashing password
  for (let user of sample_users) {
    user.password = await bcrypt.hash(user.password, PASSWORD_HASH);
    await UserModel.create(user);
  }
  console.log("User is succesfully created");
}

async function addCategories() {
  const categoryCount = await CategoryModel.countDocuments();
  if (categoryCount > 0) {
    console.log("Categories are already added");
    return;
  }

  for (let category of sample_categories) {
    await CategoryModel.create(category);
  }
  console.log("Categories successfully created");
}

async function addFood() {
  const food = await FoodModel.countDocuments();
  if (food > 0) {
    console.log("food has been created successfully");
    return;
  }
  //adding food attributes EX: images, price, etc
}

async function addCart() {
  // Fetch all users
  const users = await UserModel.find();
  for (const user of users) {
    // Check if the user already has a cart
    const cartExists = await CartModel.findOne({ user: user });
    if (!cartExists) {
      // Create a new cart for this user
      const newCart = new CartModel({
        user: user,

        foodList: [],
        totalPrice: 0,
      });
      await newCart.save();
    }
  }
  console.log("Carts are set up successfully");
}
