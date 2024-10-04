import express from "express";
import { authUser } from "../Middleware/verifyToken.js";
import {
  createPost,
  deletePost,
  getAllPosts,
  getFeedPosts,
  getPost,
  getUserPosts,
  likePost,
  replyToPost,
} from "../Controllers/postController.js";

const router = express.Router();

router.get("/feed", authUser, getFeedPosts);
router.get("/:id", getPost);
router.get("/", getAllPosts);
router.get("/user/:username", getUserPosts);
router.post("/create", authUser, createPost);
router.delete("/:id", authUser, deletePost);
router.post("/like/:postId", authUser, likePost);
router.post("/reply/:id", authUser, replyToPost);

export default router;
