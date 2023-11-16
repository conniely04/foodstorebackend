import { Router } from "express";
import jwt from "jsonwebtoken";

import { BAD_REQUEST } from "../constants/httpStatus.js";
import handler from "express-async-handler";
import { UserModel } from "../models/user.model.js";
import bcrypt from "bcryptjs";

const router = Router();

//login api requests
router.post(
  "/login",
  handler(async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    //logging in
    if (user && (await bcrypt.compare(password, user.password))) {
      res.send(generateTokenResponse(user));
      return;
    }
    //if user cant be found
    res.status(BAD_REQUEST).send("Username or password is invalid");
  })
);

//communication between front and backend for login/user details
const generateTokenResponse = (user) => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    //im not sure if JWT_Seecret has to be same as mine i dont think so but i can send if needed
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
  return {
    //information sent back to the frontend
    id: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.isAdmin,
    token,
  };
};

export default router;
