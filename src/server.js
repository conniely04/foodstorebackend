import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

//route imports
import foodRouter from "./routers/food.router.js";
import userRouter from "./routers/user.router.js";

import { dbconnect } from "./config/database.config.js";
dbconnect();

const app = express();
app.use(express.json());
app.use(express.static("public"));

//FRONTEND PORTLISTNENING
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000"],
  })
);

//APP ROUTERS
//router for user logins
app.use("/api/users", userRouter);

//registration post
app.post("/api/users/register", userRouter);

//set router of pantry staples add more if needed
app.use("/api/foods", foodRouter);
//search for food router add code from 10:04
/*
router.get("/search/:searchTerm"),
  (req, res) => {
    const { searchTerm } = req.params;
  };*/

//BACKEND PORT LISTENING
//connection to port 5000 doesnt work for some reason for me
const PORT = 5001;
app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
