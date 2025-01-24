import express from "express";
import { uploadCompanyData } from "../controllers/dashboard.controllers.js";
import upload from "../middlewares/multer.middlewares.js";
const router = express.Router();

// Apply the Multer middleware to the /upload route
router.post(
  "/upload",
  (req, res, next) => {
    console.log("Route /api/dashboard/upload hit");
    next(); // Pass the request to the next middleware
  },
  upload.fields([
    { name: "pdf1", maxCount: 1 },
    { name: "pdf2", maxCount: 1 },
  ]),
  (req, res, next) => {
    try {
      console.log("Multer middleware executed");
      console.log("Files received by Multer:", req.files);
      console.log("Request body:", req.body);
      next();
    } catch (error) {
      next(error);
    }
  },
  uploadCompanyData
);


export default router;
