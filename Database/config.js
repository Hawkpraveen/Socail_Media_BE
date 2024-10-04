import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoDB_URL = process.env.MONGODB_URL;

const connectDb = async (req, res) => {
  try {
    const connection = mongoose.connect(mongoDB_URL);
    console.log("MongoDB connected");
    return connection;
  } catch (error) {
    resizeBy.status(500).json({ message: error.message });
  }
};

export default connectDb;
