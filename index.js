import express from "express";
import dotenv from "dotenv";
import connectDb from "./Database/config.js";
import cors from "cors";
import userRouter from "./Routers/userRouter.js";
import postRouter from "./Routers/postRouter.js";
import { v2 as cloudinary } from "cloudinary";

const app = express();

dotenv.config();


app.use(express.json({ limit: "50mb" })); // To parse JSON data in the req.body
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);


cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});


connectDb();
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to my API" });
});

//user Router

app.use("/api/users", userRouter);
app.use("/api/post", postRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on....`);
});
