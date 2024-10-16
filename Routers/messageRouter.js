import express from "express";
import { authUser } from "../Middleware/verifyToken.js";
import { getMessage, sendMessage } from "../Controllers/messageController.js";

const router = express.Router();

router.get("/conversation/:id", authUser, getMessage); // Fetch conversation
router.post("/message/:id", authUser, sendMessage); // Send message


export default router;
