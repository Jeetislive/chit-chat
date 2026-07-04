import * as conversationService from "../services/conversation.service.js";

export async function getConversations(req, res) {
    const result = await conversationService.getConversations(req.user._id);
    res.json(result);
}
