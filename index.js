import express from "express";
import dotenv from "dotenv";
import connectDb from "./Database/config.js";
import cors from "cors";
import userRouter from "./Routers/userRouter.js";
import postRouter from "./Routers/postRouter.js";
import { v2 as cloudinary } from "cloudinary";
import messageRouter from "./Routers/messageRouter.js";
import { app, server } from "./Socket/socket.js";

//const app = express();

dotenv.config();

app.use(express.json({ limit: "50mb" })); // To parse JSON data in the req.body
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
  origin: "*",
  credentials: true,
};
app.use(cors(corsOptions));

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
app.use("/api/messages", messageRouter);

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server running on.... `);
});
