import { Router } from "express";
import { FoodModel, FoodSchema } from "../models/food.model.js";
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

router.get(
  "/search/:searchFood",
  handler(async (req, res) => {
    try {
      const { searchFood } = req.params;
      const searchregex = new RegExp(searchFood, "i");

      const foods = await FoodModel.find({ name: { $regex: searchregex } });
      res.send(foods);
    } catch (error) {
      res.status(500).send("error searching for item");
    }
  })
);

export default router;
