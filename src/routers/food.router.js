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

router.get(
  "/:foodId",
  handler(async (req, res) => {
    const { foodId } = req.params;

    // Find the food item by ID
    const food = await FoodModel.findById(foodId);

    if (!food) {
      // If food item not found, return a 404 response
      res.status(404).json({ message: "Food item not found" });
      return;
    }

    // Food item found, send it as a JSON response
    res.json(food);
  })
);

export default router;
