import * as conversationService from "../services/conversation.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getConversations = asyncHandler(async (req, res) => {
    const result = await conversationService.getConversations(req.user._id);
    res.json(result);
});
