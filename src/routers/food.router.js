import { Router } from "express";
import { FoodModel } from "../models/food.model.js";
import handler from "express-async-handler";

const router = Router();
//food api specific data requests
router.get(
  "/",
  handler(async (req, res) => {
    const foods = await FoodModel.find({});
    res.send(foods);
  })
);

router.get(
  "/category/:category",
  handler(async (req, res) => {
    const { category } = req.params;
    const foods = await FoodModel.find({ category: category });
    res.send(foods);
  })
);

export default router;
