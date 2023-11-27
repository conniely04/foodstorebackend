import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

// Route imports
import foodRouter from "./routers/food.router.js";
import userRouter from "./routers/user.router.js";
// import cartRouter from "./routers/cart.router.js";

import { dbconnect } from "./config/database.config.js";
dbconnect();

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Enable CORS for frontend
app.use(cors({
    credentials: true,
    origin: ["http://localhost:3000"],
}));

// API Routes
app.use("/api/foods", foodRouter);
app.use("/api/users", userRouter);
// app.use("/api/cart", cartRouter);

// Search for food - ensure this logic is handled in food.router.js
// app.use("/api/foods/search", foodRouter); // This line seems redundant if search is handled in foodRouter

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
