//BACKEND APIS
import { Router } from "express";
import jwt from "jsonwebtoken";

import { BAD_REQUEST } from "../constants/httpStatus.js";
import handler from "express-async-handler";
import { UserModel } from "../models/user.model.js";
import { CartModel } from "../models/cart.model.js";
import { FoodModel } from "../models/food.model.js";
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
      const tokenResponse = generateTokenResponse(user);
      const userResponse = {
        id: user._id, // Make sure to send the user's ID
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        address: user.address,
        isAdmin: user.isAdmin, // Include isAdmin if required
        token: tokenResponse.token, // Include the token
      };

      let cart = await CartModel.findOne({ user: user });
      if (!cart) {
        cart = new CartModel({
          userId: user,
          foodList: [],
          totalPrice: 0,
        });
        await cart.save();
      }

      const combinedResponse = {
        user: userResponse,
        cart: cart, // Cart information
      };

      res.send(combinedResponse);
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

router.post("/addToCart", validateJwt, async (req, res) => {
  const userId = req.auth.id; // Extract user ID from JWT
  const { foodId, quantity, price } = req.body;

  try {
    // Find the user's cart and populate the 'food' field
    let cart = await CartModel.findOne({ user: userId }).populate(
      "foodList.food"
    );

    if (!cart) {
      // If no cart exists, create a new one
      cart = new CartModel({ user: userId, foodList: [], totalPrice: 0 });
    }

    // Find the item in the cart
    const itemIndex = cart.foodList.findIndex((item) =>
      item.food.equals(foodId)
    );

    if (itemIndex > -1) {
      // Update quantity if item exists
      cart.foodList[itemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.foodList.push({ food: foodId, quantity });
    }

    // Calculate and update the totalPrice based on the quantity and food prices
    const updatedTotalPrice = cart.foodList.reduce((total, item) => {
      // Use the 'price' argument from the request body
      const foodPrice = price;
      return total + foodPrice * item.quantity;
    }, 0);
    cart.totalPrice = updatedTotalPrice;

    //TEST
    await cart.populate("foodList.food").execPopulate();
    await cart.save();
    res.json(cart);
    console.log(cart);
  } catch (error) {
    console.error("Error in addToCart:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Create a route to remove an item from the cart

router.delete(
  "/removeitem/:foodId/:quantity",
  validateJwt,
  async (req, res) => {
    const userId = req.auth.id; // Extract user ID from JWT
    const { foodId, quantity } = req.params;
    console.log("request results:", req.params);

    let newTotalPrice = 0;
    let itemRemoved = false;

    try {
      // Find the user's cart
      let cart = await CartModel.findOne({ user: userId });

      if (!cart) {
        // If no cart exists, send a response indicating that the item was not found
        return res.status(404).json({ message: "Cart not found" });
      }

      // Find the index of the item to be removed in the foodList
      const itemIndex = cart.foodList.findIndex((item) =>
        item.food.equals(foodId)
      );

      if (itemIndex === -1) {
        // If the item is not found in the cart, send a response indicating that the item was not found
        return res.status(404).json({ message: "Item not found in cart" });
      }

      // Remove the item from the foodList
      if (cart.foodList[itemIndex].quantity > quantity) {
        cart.foodList[itemIndex].quantity -= quantity;
      } else {
        cart.foodList.splice(itemIndex, 1);
      }

      // Calculate and update the totalPrice based on the remaining items
      let newTotalPrice = 0;
      for (const item of cart.foodList) {
        const foodItem = await FoodModel.findById(item.food);
        newTotalPrice += foodItem.price * item.quantity;
      }

      cart.totalPrice = newTotalPrice;
      // Save the updated cart
      await cart.save();

      // Send a response indicating that the item has been successfully removed
      res.json({ message: "Item removed from cart", cart });
    } catch (error) {
      console.error("Error removing item from cart:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
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

      //PUT MANAGER PIN in .ENV!!!!!!!!
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
      const createdUser = await UserModel.create(newUser);
      const newCart = new CartModel({
        user: createdUser,
        foodList: [],
        totalPrice: 0,
        // Add other fields as necessary
      });
      await newCart.save();
      const combinedResponse = {
        user: generateTokenResponse(createdUser),
        cart: newCart, // Cart information
      };

      res.send(combinedResponse);
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
