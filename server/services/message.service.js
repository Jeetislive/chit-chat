import Conversation from "../model/conversationSchema.js";
import Message from "../model/messageSchema.js";
import { NotFoundError } from "../errors/AppError.js";

export async function sendMessage(senderId, receiverId, content, replyToId, encrypted = false, nonce = null) {
    let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
        conversation = new Conversation({ participants: [senderId, receiverId] });
    }

    const newMessage = new Message({
        sender: senderId,
        receiver: receiverId,
        content,
        encrypted,
        nonce,
        replyTo: replyToId || null,
    });

    conversation.messages.push(newMessage._id);
    await Promise.all([conversation.save(), newMessage.save()]);

    if (replyToId) {
        await newMessage.populate("replyTo");
    }

    return newMessage;
}

export async function getConversationMessages(userId, otherUserId, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const total = await Message.countDocuments({
        $or: [
            { sender: userId, receiver: otherUserId },
            { sender: otherUserId, receiver: userId },
        ],
    });

    const messages = await Message.find({
        $or: [
            { sender: userId, receiver: otherUserId },
            { sender: otherUserId, receiver: userId },
        ],
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("replyTo");

    return {
        messages: messages.reverse(),
        page,
        hasMore: skip + limit < total,
        total,
    };
}

export async function deleteMessage(messageId, userId) {
    const message = await Message.findOne({ _id: messageId, sender: userId });
    if (!message) throw new NotFoundError("Message not found");
    if (message.isDeleted) return message;

    message.isDeleted = true;
    await message.save();
    return message;
}
