// import {response, Router } from "express";
// import { CartModel } from "../models/cart.model.js";
// import handler from "express-async-handler";
// import authenticate from "../middleware/cartMiddleware.js";
// import generateTokenResponse from "../middleware/cartMiddleware.js";




// const router = Router();


// // Cart API specific data requests
// router.get("/", authenticate,handler(async (req, res) => {
//   try {
//     // Extract user ID from token
//     const userId = req.user; 

//     // Fetch the cart for the authenticated user
//     const cart = await CartModel.findOne({ cart: userId });

//     if (!cart) {
//       return res.status(404).send('Cart not found');
//     }

//     res.send(cart);
//   } catch (error) {
//     res.status(500).send('Error fetching cart: ' + error.message);
//   }
// }));

// // POST route to create a new cart
// router.post('/create', async (req, res) => {
//   try {
//     const userId = req.body.userId; // Get the user ID from the request body
//     const existingCart = await CartModel.findOne({ user: userId });

//     // Check if the user already has a cart
//     if (existingCart) {
//       res.status(400).send("Cart already exists for this user.");
//       return;
//     }

//     // Create a new empty cart for the user
//     const newCart = new CartModel({
//       user: userId,
//       foodList: [],
//       totalPrice: 0
//     });

//     const result = await newCart.save();
//     res.status(201).send(result);
//   } catch (error) {
//     console.error("Error creating cart:", error);
//     res.status(500).send("Error occurred during cart creation");
//   }
// });


//   router.post('/add',authenticate, async (req, res) => {
//     const userId = req.user._id; // Get user ID from authenticated user
//     const { productId, quantity } = req.body;
  
//     try {
//       // Find the user's cart or create a new one if it doesn't exist
//       let cart = await CartModel.findOne({ user: userId });
//       if (!cart) {
//         cart = new CartModel({ user: userId, foodList: [], totalPrice: 0 });
//       }
  
//       // Logic to add the product to cart.foodList and update totalPrice
//       // ...
  
//       await cart.save();
//       res.status(200).json(cart);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   });

// router.delete("/remove/:itemId", handler(async (req, res) => {
//   const { userId } = req.body;
//   const { itemId } = req.params;

//   const cart = await CartModel.findOne({ userId: userId });
//   if (cart) {
//       cart.foodList = cart.foodList.filter(item => item._id.toString() !== itemId);
//       await cart.save();
//       res.status(200).send('Item removed from cart');
//   } else {
//       res.status(404).send('Cart not found');
//   }
// }));

// router.delete("/clear", handler(async (req, res) => {
//   const { userId } = req.body;

//   const cart = await CartModel.findOne({ userId: userId });
//   if (cart) {
//       cart.foodList = [];
//       await cart.save();
//       res.status(200).send('Cart cleared');
//   } else {
//       res.status(404).send('Cart not found');
//   }
// }));



  


// export default router;
