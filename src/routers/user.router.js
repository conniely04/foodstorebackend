//BACKEND APIS
import { Router } from "express";
import jwt from "jsonwebtoken";

import { BAD_REQUEST } from "../constants/httpStatus.js";
import handler from "express-async-handler";
import { UserModel } from "../models/user.model.js";
import bcrypt from "bcryptjs";
const PASSWORD_HASH = 10;
import validateJwt from "../middleware/auth.js";

const router = Router();
const MANAGER_REGISTRATION_PIN = "1234";

//login api requests

router.post(
  "/login",
  handler(async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    //logging in
    if (user && (await bcrypt.compare(password, user.password))) {
      const response = generateTokenResponse(user);
      response.firstname = user.firstname;
      response.lastname = user.lastname;
      response.email = user.email;
      response.password = user.password;
      response.address = user.address;
      res.send(response);
      return;
    }
    //if user cant be found
    res.status(BAD_REQUEST).send("Username or password is invalid");
  })
);

//validate user to check if they are logged in or not
router.get("/validateToken", validateJwt, (req, res) => {
  // If the token is valid, expressJwt will attach the decoded token to req.auth
  if (req.auth && req.auth.id) {
    res.json({ isValid: true });
  } else {
    res.json({ isValid: false });
  }
});
router.get("/protected", validateJwt, (req, res) => {
  res.json({ message: "This is a protected route" });
});
router.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).send("Invalid token...");
  }
});

//test api to see all users (USE for MANAGER PAGE)
router.get(
  "/",
  handler(async (req, res) => {
    const users = await UserModel.find({});
    res.send(users);
  })
);

//post to create user
router.post(
  "/register",
  handler(async (req, res) => {
    try {
      const { firstname, lastname, email, password, address, pin } = req.body;
      const user = await UserModel.findOne({ email: email.toLowerCase() });

      //checking if user already exists
      if (user) {
        res.status(BAD_REQUEST).send("User already exists, please login.");
        return;
      }
      const isAdmin = pin === MANAGER_REGISTRATION_PIN;
      //if new user hash password
      const hashedPassword = await bcrypt.hash(password, PASSWORD_HASH);
      const newUser = {
        //email to lower??
        firstname,
        lastname,
        email: email.toLowerCase(),
        password: hashedPassword,
        address,
        isAdmin,
      };

      const result = await UserModel.create(newUser);
      res.send(generateTokenResponse(result));
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).send("Error occurred during registration");
    }
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
    process.env.JWT_SECRET,
    {
      //can test that u need to log in by changing the time here to "3s"
      expiresIn: "1h",
    }
  );
  return {
    //information sent back to the frontend
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,

    isAdmin: user.isAdmin,

    token,
  };
};

export default router;
