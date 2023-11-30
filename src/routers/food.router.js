import handler from "express-async-handler";
import express from "express";
import multer from "multer";
import { FoodModel } from "../models/food.model.js"; // Adjust the path as needed

const router = express.Router();
// const router = Router();
//food api specific data requests
router.get(
  "/",
  handler(async (req, res) => {
    const foods = await FoodModel.find({});
    res.send(foods);
  })
);

router.get("/category/:categoryId", async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const foods = await FoodModel.find({ category: categoryId });

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

//NEW CODE
// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "foodstorefrontend/public/food"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// POST route to add a new food item
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, price, inStock } = req.body;
    const newFood = new FoodModel({
      name,
      price,
      inStock,
      image: req.file.path.replace("foodstorefrontend/public/", ""),
    });
    await newFood.save();
    res.status(201).json(newFood);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT route to update an existing food item
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const updates = req.body;
    if (req.file) {
      updates.image = req.file.path.replace("foodstorefrontend/public/", "");
    }
    const updatedFood = await FoodModel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    res.json(updatedFood);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//new code ends

export default router;
