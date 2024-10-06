import Conversation from "../Models/conversationModel.js";
import Message from "../Models/messageModel.js";
import { getReceiverSocketId, io } from "../Socket/socket.js";

// for chatting
export const sendMessage = async (req, res) => {
    try {
      const senderId = req.user.id;
      const receiverId = req.params.id;
      const { textMessage: message } = req.body;
  
      // Check if the conversation exists
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      });
  
      // Establish the conversation if not started yet.
      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, receiverId],
        });
      }
  
      // Create a new message with conversationId
      const newMessage = await Message.create({
        senderId,
        receiverId,
        message,
        conversationId: conversation._id, // Add the conversationId here
      });
  
      if (newMessage) {
        conversation.messages.push(newMessage._id);
      }
  
      await Promise.all([conversation.save(), newMessage.save()]);
  
      // Implement socket io for real-time data transfer
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }
  
      return res.status(201).json({
        success: true,
        newMessage,
      });
    } catch (error) {
      console.log("Error in sending message:", error);
      return res.status(500).json({ success: false, message: "Failed to send message." });
    }
  };
  
  export const getMessage = async (req, res) => {
    try {
      const senderId = req.user.id; // Ensure this is populated correctly
      const receiverId = req.params.id;
  
      const conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      }).populate("messages");
  
      if (!conversation) {
        return res.status(200).json({ success: true, messages: [] });
      }
  
      return res.status(200).json({ success: true, messages: conversation.messages });
    } catch (error) {
      console.error("Error fetching messages:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };
  
