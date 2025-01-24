import { uploadToCloudinary } from "../utils/cloudinary.js";
import Company from "../models/company.models.js";

export const uploadCompanyData = async (req, res) => {
  try {
    console.log("Files received:", req.files); // Logs the uploaded files
    console.log("Request body:", req.body);
    const { name, sector, country } = req.body;
    const pdf1 = req.files.pdf1[0]; // Access uploaded file for 'pdf1'
    const pdf2 = req.files.pdf2[0]; // Access uploaded file for 'pdf2'

    // Upload files to Cloudinary
    const pdf1Upload = await uploadToCloudinary(pdf1.path, "pdfs");
    const pdf2Upload = await uploadToCloudinary(pdf2.path, "pdfs");

    // Save to the database
    const company = new Company({
      name,
      sector,
      country,
      pdf1Url: pdf1Upload.secure_url,
      pdf2Url: pdf2Upload.secure_url,
    });
    await company.save();

    res
      .status(201)
      .json({ message: "Company data uploaded successfully!", company });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to upload data", details: error.message });
  }
};
