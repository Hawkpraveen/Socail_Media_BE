import express from "express";
import {
  deleteUser,
  followUnFollowUser,
  getUser,
  loginUser,
  registerUser,
  updateUser,
} from "../Controllers/userContoller.js";
import { authUser } from "../Middleware/verifyToken.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/signin", loginUser);
router.get("/getUser/:id", authUser, getUser);
router.put("/edit-user/:id", authUser, updateUser);
router.delete("/delete-user/:id", authUser, deleteUser);
router.post("/follow-user/:id", authUser, followUnFollowUser);

export default router;
