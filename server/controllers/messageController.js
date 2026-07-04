import Conversation from "../model/conversationSchema.js";
import Message from "../model/messageSchema.js";
import { getIO, getReceiverSocketId } from "../socket/socket.js";


export const sendMessage = async(req,res) => {
    // const id = req.params.id;
    // res.send("message sent to "+id);
    try {
        const {message} = req.body;
        const user = req.user;
        const { id: receiverId } = req.params;
        const senderId = user._id; 
        if (!user) {
            return res.status(401).json({error: "User not authenticated"});
        }
        if (!message) {
            return res.status(400).json({error: "Message is required"});
        }
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });
        if (!conversation) {
            conversation = new Conversation({
                participants: [senderId, receiverId],
            });
        }
        const newMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            message: message,
        })
        if(newMessage){
            conversation.messages.push(newMessage._id);
        }
        // await conversation.save();
		// await newMessage.save();

		// this will run in parallel
		await Promise.all([conversation.save(), newMessage.save()]);

        const io = getIO();
        const receiverSocketId = getReceiverSocketId(receiverId);
        const messageObj = newMessage.toObject();

        if (receiverSocketId) {
            messageObj.status = "delivered";
            await Message.findByIdAndUpdate(newMessage._id, { status: "delivered" });
            io.to(receiverSocketId).emit("newMessage", messageObj);
        }

        res.status(201).json({ newMessage: messageObj });
        
    } catch (error) {
        console.error("error sending message", error.message);
        res.status(500).json({err: "Internal Server Error"})
    }
    
}

export const getConversations = async(req,res) => {
    try {
        const { id :userToChatId } = req.params;
        const senderId = req.user._id;
        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
        }).populate("messages");    //not reference bur actual message
        if (!conversation) {
            return res.status(404).json([]);
        }
        if (!senderId) {
            return res.status(401).json({error: "User not authenticated"});
        }
        const messages = conversation.messages;
        res.status(200).json(messages);
        
    } catch (error) {
        console.error("error getting conversations", error.message);
        res.status(500).json({err: "Internal Server Error"})
    }
}