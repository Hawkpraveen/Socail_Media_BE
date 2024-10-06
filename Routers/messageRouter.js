import express from "express";
import { authUser } from "../Middleware/verifyToken.js";
import { getMessage, sendMessage } from "../Controllers/messageController.js";

const router = express.Router();

router.get("/all/:id", authUser,getMessage );
router.post("/send/:id", authUser, sendMessage);

export default router;
