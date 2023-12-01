//BACKEND APIS
import { Router } from "express";
import jwt from "jsonwebtoken";
import { OrderStatus } from "../constants/orderStatus.js";
import { BAD_REQUEST } from "../constants/httpStatus.js";
import handler from "express-async-handler";
import { UserModel } from "../models/user.model.js";
import { CartModel } from "../models/cart.model.js";
import { FoodModel } from "../models/food.model.js";
import { OrderModel } from "../models/order.model.js";
import bcrypt from "bcryptjs";
const PASSWORD_HASH = 10;
import validateJwt from "../middleware/auth.js";
import mongoose from "mongoose";
const router = Router();
const MANAGER_REGISTRATION_PIN = "1234";

const ObjectId = mongoose.Types.ObjectId;
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

    await cart.save();

    cart = await CartModel.findOne({ user: userId }).populate("foodList.food");

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

    try {
      // Find the user's cart
      let cart = await CartModel.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      // Find the index of the item to be removed in the foodList
      const itemIndex = cart.foodList.findIndex(
        (item) => item.food._id.toString() === foodId
      );

      if (itemIndex === -1) {
        return res.status(404).json({ message: "Item not found in cart" });
      }

      // Remove the item from the foodList
      if (cart.foodList[itemIndex].quantity > parseInt(quantity)) {
        cart.foodList[itemIndex].quantity -= parseInt(quantity);
      } else {
        cart.foodList.splice(itemIndex, 1);
      }

      // Recalculate the totalPrice
      let newTotalPrice = 0;
      for (const item of cart.foodList) {
        const foodItem = await FoodModel.findById(item.food);
        newTotalPrice += foodItem.price * item.quantity;
      }
      cart.totalPrice = newTotalPrice;

      // Save the updated cart
      await cart.save();

      // Repopulate the food objects before sending the response
      cart = await CartModel.findOne({ user: userId }).populate(
        "foodList.food"
      );

      // Send the response
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

router.post("/createorder", validateJwt, async (req, res) => {
  console.log("Route hit");
  console.log("Body: ", req.body);
  try {
    // Extract order data from request body
    const {
      user,
      name,
      address,
      email,
      paymentId,
      cvv,
      phone,
      city,
      country,
      zip,
      cardname,
      totalPrice,
      items,
    } = req.body;
    console.log("BACKEND ORDER DATA: ", req.body);

    // Additional data validation can be done here
    const userObjectId = new mongoose.Types.ObjectId(user);

    // Create a new order in the database
    const newOrder = await OrderModel.create({
      // Assuming this is the user's ID
      name,
      address,
      email,
      paymentId,
      cvv,
      phone,
      city,
      country,
      zip,
      cardname,
      totalPrice,
      items,
      user: userObjectId,
      // Ensure the items structure matches what OrderModel expects
      // You can add more fields as per your OrderModel schema
    });

    // Send back the created order as a response

    console.log("NEW BACKEND ORDER MADE: ", newOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating order" });
  }
});

//CLEAR CART ENDPOINT
router.post("/clearCart", validateJwt, async (req, res) => {
  try {
    const userId = req.user.id;
    await UserModel.findByIdAndUpdate(
      userId,
      { $set: { "cart.foodList": [], "cart.totalPrice": 0 } },
      { new: true }
    );
    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Error clearing cart" });
  }
});

router.put("/updatecart", validateJwt, async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from JWT
    const updatedCart = req.body; // The updated cart data from the frontend

    // Update the user's cart in the database
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { cart: updatedCart } },
      { new: true } // Return the updated user document
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Cart updated successfully", cart: user.cart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Error updating cart" });
  }
});
//GET ORDERS
router.get(
  "/orders",
  validateJwt,
  handler(async (req, res) => {
    try {
      const userId = req.auth.id; // Extract user ID from JWT

      // Find orders associated with the user
      const orders = await OrderModel.find({
        user: new mongoose.Types.ObjectId(userId),
      });

      if (!orders) {
        return res
          .status(404)
          .json({ message: "No orders found for this user" });
      }
      console.log("USER ORDERS BACKEND: ", orders);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Internal Server Error" });
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
