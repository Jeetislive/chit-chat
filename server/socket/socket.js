import Message from "../model/messageSchema.js";
import Conversation from "../model/conversationSchema.js";
import { logger } from "../config/logger.js";

let io;
const userSocketMap = new Map();

export function setupSocket(socketIO) {
    io = socketIO;

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;

        if (userId) {
            userSocketMap.set(userId, socket.id);
            logger.info({ userId, socketId: socket.id }, "User connected");
            io.emit("onlineUsers", Array.from(userSocketMap.keys()));
        }

        socket.on("typing", ({ receiverId }) => {
            const receiverSocketId = userSocketMap.get(receiverId);
            if (receiverSocketId) {
                socket.to(receiverSocketId).emit("typing", { senderId: userId });
            }
        });

        socket.on("stopTyping", ({ receiverId }) => {
            const receiverSocketId = userSocketMap.get(receiverId);
            if (receiverSocketId) {
                socket.to(receiverSocketId).emit("stopTyping", { senderId: userId });
            }
        });

        socket.on("markRead", async ({ otherUserId }) => {
            try {
                const conversation = await Conversation.findOne({
                    participants: { $all: [userId, otherUserId] },
                });
                if (!conversation) return;

                const result = await Message.updateMany(
                    {
                        _id: { $in: conversation.messages },
                        sender: otherUserId,
                        receiver: userId,
                        status: { $ne: "read" },
                    },
                    { status: "read" }
                );

                if (result.modifiedCount > 0) {
                    const otherSocketId = userSocketMap.get(otherUserId);
                    if (otherSocketId) {
                        socket.to(otherSocketId).emit("messagesRead", {
                            conversationId: conversation._id,
                            readBy: userId,
                        });
                    }
                }
            } catch (error) {
                logger.error({ err: error, userId, otherUserId }, "markRead error");
            }
        });

        socket.on("disconnect", () => {
            if (userId) {
                logger.info({ userId }, "User disconnected");
                userSocketMap.delete(userId);
                io.emit("onlineUsers", Array.from(userSocketMap.keys()));
            }
        });
    });
}

export function getIO() {
    return io;
}

export function getReceiverSocketId(receiverId) {
    return userSocketMap.get(receiverId);
}
