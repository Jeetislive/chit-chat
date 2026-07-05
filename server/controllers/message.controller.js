import * as messageService from "../services/message.service.js";
import { getIO, getReceiverSocketId } from "../socket/socket.js";
import Message from "../model/messageSchema.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const sendMessage = asyncHandler(async (req, res) => {
    const { id: receiverId } = req.params;
    const { content, replyTo, encrypted, nonce } = req.body;

    const newMessage = await messageService.sendMessage(req.user._id, receiverId, content, replyTo, encrypted || false, nonce || null);

    const io = getIO();
    const receiverSocketId = getReceiverSocketId(receiverId);
    const messageObj = newMessage.toObject();

    if (receiverSocketId) {
        messageObj.status = "delivered";
        await Message.findByIdAndUpdate(newMessage._id, { status: "delivered" });
        io.to(receiverSocketId).emit("newMessage", messageObj);
    }

    res.status(201).json({ newMessage: messageObj });
});

export const getConversationMessages = asyncHandler(async (req, res) => {
    const { id: userToChatId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));

    const result = await messageService.getConversationMessages(req.user._id, userToChatId, page, limit);
    res.json(result);
});

export const clearConversation = asyncHandler(async (req, res) => {
    const { id: otherUserId } = req.params;
    const result = await messageService.clearConversation(req.user._id, otherUserId);

    const io = getIO();
    const receiverSocketId = getReceiverSocketId(otherUserId);
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("conversationCleared", {
            byUserId: req.user._id,
        });
    }

    res.json(result);
});

export const deleteMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const deleted = await messageService.deleteMessage(messageId, req.user._id);

    const io = getIO();
    const otherId = deleted.sender.toString() === req.user._id.toString()
        ? deleted.receiver.toString()
        : deleted.sender.toString();
    const receiverSocketId = getReceiverSocketId(otherId);
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageDeleted", {
            messageId: deleted._id,
            sender: deleted.sender,
            receiver: deleted.receiver,
        });
    }

    res.json({ message: "Message deleted" });
});
