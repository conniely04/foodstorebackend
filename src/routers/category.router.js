import { Router } from "express";
import multer from "multer";
import path from "path";
import { CategoryModel } from "../models/category.model.js";
import handler from "express-async-handler";

const router = Router();

// Configure multer for image storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images'); // Adjust the directory as needed
    },
    filename: function (req, file, cb) {
        // Use the original file extension
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Get all categories
router.get('/', handler(async (req, res) => {
  const categories = await CategoryModel.find();
  res.json(categories);
}));

// Add a new category with image upload
router.post('/', upload.single('image'), handler(async (req, res) => {
  const category = new CategoryModel({
    name: req.body.name,
    description: req.body.description,
    image: req.file.path, // Path where the image is stored
  });

  const newCategory = await category.save();
  res.status(201).json(newCategory);
}));

// Update an existing category
router.put('/:id', upload.single('image'), handler(async (req, res) => {
  let categoryUpdates = {
      name: req.body.name,
      description: req.body.description,
  };

  if (req.file) {
      categoryUpdates.image = 'public/images/thumbnail' + path.basename(req.file.path); // Update image path if a new image is uploaded
  }

  const updatedCategory = await CategoryModel.findByIdAndUpdate(
      req.params.id,
      categoryUpdates,
      { new: true }
  );

  res.json(updatedCategory);
}));

export default router;
