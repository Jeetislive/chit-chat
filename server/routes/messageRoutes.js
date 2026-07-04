import express from "express"
import { protectRoutes } from "../middleware/protectRoutes.js";
import { validate } from "../middleware/validate.js";
import { sendMessageSchema } from "../validators/message.validator.js";
import * as messageController from "../controllers/message.controller.js";

const router = express.Router();

router.post("/send/:id", protectRoutes, validate(sendMessageSchema), messageController.sendMessage);
router.get("/:id", protectRoutes, messageController.getConversationMessages);
router.delete("/:messageId", protectRoutes, messageController.deleteMessage);

export default router;
