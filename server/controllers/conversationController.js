import User from "../model/userAuthSchema.js";
import Message from "../model/messageSchema.js";

export const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        const allUsers = await User.find({ _id: { $ne: userId } })
            .select("name username profilePic")
            .lean();

        const result = await Promise.all(allUsers.map(async (otherUser) => {
            const [lastMessage] = await Message.find({
                $or: [
                    { sender: userId, receiver: otherUser._id },
                    { sender: otherUser._id, receiver: userId },
                ],
            })
                .sort({ createdAt: -1 })
                .limit(1)
                .select("message createdAt")
                .lean();

            const unreadCount = await Message.countDocuments({
                sender: otherUser._id,
                receiver: userId,
                status: { $ne: "read" },
            });

            return {
                user: {
                    _id: otherUser._id,
                    name: otherUser.name,
                    username: otherUser.username,
                    profilePic: otherUser.profilePic,
                },
                lastMessage: lastMessage
                    ? { message: lastMessage.message, createdAt: lastMessage.createdAt }
                    : null,
                unreadCount,
            };
        }));

        result.sort((a, b) => {
            if (!a.lastMessage && !b.lastMessage) return 0;
            if (!a.lastMessage) return 1;
            if (!b.lastMessage) return -1;
            return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
        });

        res.json(result);
    } catch (error) {
        console.error("Error fetching conversations:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};
