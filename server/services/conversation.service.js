import User from "../model/userAuthSchema.js";
import Message from "../model/messageSchema.js";

export async function getConversations(userId) {
    const allUsers = await User.find({ _id: { $ne: userId } })
        .select("name username profilePic")
        .lean();

    const result = await Promise.all(allUsers.map(async (otherUser) => {
        const [lastMessage] = await Message.find({
            $or: [
                { sender: userId, receiver: otherUser._id },
                { sender: otherUser._id, receiver: userId },
            ],
            isDeleted: { $ne: true },
        })
            .sort({ createdAt: -1 })
            .limit(1)
            .select("content createdAt encrypted")
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
                ? { content: lastMessage.encrypted ? "" : (lastMessage.content || ""), createdAt: lastMessage.createdAt }
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

    return result;
}
