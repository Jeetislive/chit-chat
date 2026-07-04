import express from "express"
import { protectRoutes } from "../middleware/protectRoutes.js";
import * as conversationController from "../controllers/conversation.controller.js";

const router = express.Router();

router.get("/", protectRoutes, conversationController.getConversations);

export default router;
