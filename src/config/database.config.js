import mongoose, { set } from "mongoose";

import { UserModel } from "../models/user.model.js";
import { FoodModel } from "../models/food.model.js";
import { sample_users } from "../data.js";
import { sample_foods } from "../data.js";
import bcrypt from "bcryptjs";
const PASSWORD_HASH = 10;
set("strictQuery", true);

mongoose.set("strictQuery", true);

//you can connect your own mongoURI (make sure to put in your.env file)

export const dbconnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {});
    await addUsers();
    await addFood();
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

async function addFood() {
  const food = await FoodModel.countDocuments();
  if (food > 0) {
    console.log("food has been created successfully");
    return;
  }
  //adding food attributes EX: images, price, etc
  for (const food of sample_foods) {
    food.image = `/food/${food.image}`;
    await FoodModel.create(food);
  }
  console.log("food successfully created");
}
