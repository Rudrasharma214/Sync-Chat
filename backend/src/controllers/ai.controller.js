import AI from "../models/ai.model.js";
import cloudinary from "../lib/cloudinary.js";
import axios from "axios";
import { getReceiverSocketId, io } from "../lib/socket.js";
import mongoose from "mongoose"; // Import mongoose to work with ObjectIds

// Define a fixed ObjectId for the AI system.
// You should generate a valid 24-character hex string once and use it here.
// Example: new mongoose.Types.ObjectId('60c72b2f9b2f8f2e2c000001')
// You can get a new one by running `new mongoose.Types.ObjectId().toString()` in your Node.js console.
const AI_SYSTEM_ID = new mongoose.Types.ObjectId("652c78f11a8c0e2a3b900000"); // <<< IMPORTANT: Replace with your chosen fixed AI_ID

export const ailogic = async (req, res) => {
  try {
    const { question, image } = req.body;
    const userId = req.user._id; // This is the ObjectId of the authenticated user

    let imageUrl = null;

    // Upload image if provided
    if (image) {
      const uploadedImage = await cloudinary.uploader.upload(image, {
        folder: "ai-chats",
      });
      imageUrl = uploadedImage.secure_url;
    }

    // Send user question to Gemini API
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: question }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const aiReply =
      geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    // Save user's question (sender: user, receiver: AI_SYSTEM_ID)
    await AI.create({
      senderId: userId,
      receiverId: AI_SYSTEM_ID, // Use the fixed ObjectId for the AI system
      text: question,
      image: imageUrl,
    });

    // Save AI's reply (sender: AI_SYSTEM_ID, receiver: user)
    // This ensures the message direction is correctly recorded in the database
    const aiMessage = await AI.create({
      senderId: AI_SYSTEM_ID, // AI is the sender
      receiverId: userId,    // User is the receiver
      text: aiReply,
    });

    // Emit AI reply to user via socket
    const receiverSocketId = getReceiverSocketId(userId);
    if (receiverSocketId) {
      // Emit the AI's message to the user's socket
      io.to(receiverSocketId).emit("newMessage", aiMessage);
    }

    // Send AI reply back to frontend
    res.status(200).json({ success: true, reply: aiReply });
  } catch (error) {
    console.error("AI logic error:", error.message);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};


export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    // console.log("getChatHistory: Fetching chat history for User ID:", userId ? userId.toString() : "undefined");
    // console.log("getChatHistory: AI System ID:", AI_SYSTEM_ID.toString());
    // Fetch all chats involving this user and the AI_SYSTEM_ID
    // This query retrieves both user's questions to AI and AI's replies to the user
    const chats = await AI.find({
      $or: [
        { senderId: userId, receiverId: AI_SYSTEM_ID }, // Messages from user to AI
        { senderId: AI_SYSTEM_ID, receiverId: userId }  // Messages from AI to user
      ]
    }).sort({ createdAt: 1 }); // Sort by creation date to maintain conversation order

    // Format for frontend:
    // Determine the role ('user' or 'ai') based on who the sender is
    const formattedChats = chats.map(chat => ({
      // Use .equals() for robust comparison of ObjectId instances
      role: chat.senderId.equals(userId) ? 'user' : 'ai',
      content: chat.text,
      image: chat.image || null, // Include image if it exists
      timestamp: chat.createdAt, // Include timestamp for display purposes
    }));

    res.status(200).json({ success: true, chats: formattedChats });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ success: false, message: "Failed to load chat history." });
  }
};