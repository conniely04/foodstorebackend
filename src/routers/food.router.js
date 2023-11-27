import handler from "express-async-handler";
import express from 'express';
import { FoodModel } from '../models/food.model.js'; // Adjust the path as needed

const router = express.Router();
// const router = Router();
//food api specific data requests
router.get("/", handler(async (req, res) => {
    const foods = await FoodModel.find({});
    res.send(foods);
  })
);

router.get('/category/:categoryId', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    console.log("Received Category ID:", categoryId);
    const foods = await FoodModel.find({ category: categoryId });
    console.log("Queried Foods:", foods);
    res.json(foods);
  } catch (error) {
    console.error("Error fetching foods for category:", error);
    res.status(500).json({ message: error.message });
  }
});


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
