import Message from "../model/messageSchema.js";
import Conversation from "../model/conversationSchema.js";
import { logger } from "../config/logger.js";

let io;
const userSocketMap = new Map();

function createSocketRateLimiter(windowMs, maxAllowed) {
    const counters = new Map();
    const intervals = new Map();

    return (socket, eventName) => {
        const now = Date.now();
        const key = `${socket.id}:${eventName}`;

        if (!counters.has(key)) {
            counters.set(key, []);
        }

        const timestamps = counters.get(key).filter((t) => now - t < windowMs);
        if (timestamps.length >= maxAllowed) {
            logger.warn({ socketId: socket.id, eventName }, "Socket rate limit exceeded");
            return false;
        }

        timestamps.push(now);
        counters.set(key, timestamps);

        if (!intervals.has(key)) {
            const interval = setInterval(() => {
                const ts = counters.get(key);
                if (!ts || ts.length === 0) {
                    clearInterval(interval);
                    intervals.delete(key);
                    counters.delete(key);
                }
            }, windowMs);
            intervals.set(key, interval);
        }

        return true;
    };
}

export function setupSocket(socketIO) {
    io = socketIO;

    io.engine.on("initial_headers", (headers) => {
        headers["X-RateLimit-Limit"] = "100";
    });

    const typingLimiter = createSocketRateLimiter(1000, 5);
    const markReadLimiter = createSocketRateLimiter(30000, 10);

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;

        if (!userId || typeof userId !== "string") {
            logger.warn({ socketId: socket.id }, "Connection without userId — disconnected");
            socket.disconnect(true);
            return;
        }

        userSocketMap.set(userId, socket.id);
        logger.info({ userId, socketId: socket.id }, "User connected");
        io.emit("onlineUsers", Array.from(userSocketMap.keys()));

        socket.on("typing", ({ receiverId }) => {
            if (!typingLimiter(socket, "typing")) return;
            if (!receiverId || typeof receiverId !== "string") return;
            const receiverSocketId = userSocketMap.get(receiverId);
            if (receiverSocketId) {
                socket.to(receiverSocketId).emit("typing", { senderId: userId });
            }
        });

        socket.on("stopTyping", ({ receiverId }) => {
            if (!typingLimiter(socket, "stopTyping")) return;
            if (!receiverId || typeof receiverId !== "string") return;
            const receiverSocketId = userSocketMap.get(receiverId);
            if (receiverSocketId) {
                socket.to(receiverSocketId).emit("stopTyping", { senderId: userId });
            }
        });

        socket.on("markRead", async ({ otherUserId }) => {
            if (!markReadLimiter(socket, "markRead")) return;
            if (!otherUserId || typeof otherUserId !== "string") return;
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
