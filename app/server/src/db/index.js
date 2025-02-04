import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
<<<<<<< HEAD
    await mongoose.connect(process.env.MONGODB_URI);
=======
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
>>>>>>> e38a3d0006c02fc263b1bdc0f4592d25a0aa0b97
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection failed!", error);
    process.exit(1);
  }
};

export default connectDB;
