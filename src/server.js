import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import foodRouter from "./routers/food.router.js";
import userRouter from "./routers/user.router.js";
import categoryRouter from "./routers/category.router.js";

import { dbconnect } from "./config/database.config.js";

dbconnect();

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000"], // Adjust for production if needed
  })
);

// API Routes
app.use("/api/users", userRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/foods", foodRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
