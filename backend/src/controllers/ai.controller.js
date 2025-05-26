import AI from "../models/ai.model.js";
import cloudinary from "../lib/cloudinary.js"; // Keep if you decide to upload generated images
import axios from "axios"; // Keep for other potential axios calls if any
import { getReceiverSocketId, io } from "../lib/socket.js";
import mongoose from "mongoose";

// Import GoogleGenerativeAI from the SDK
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in environment variables.");
    process.exit(1);
}

// Initialize the Generative AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const AI_SYSTEM_ID = new mongoose.Types.ObjectId("652c78f11a8c0e2a3b900000"); // <<< IMPORTANT: Replace with your chosen fixed AI_ID

export const ailogic = async (req, res) => {
    try {
        const { question, image } = req.body; // `image` here is the Base64 string from frontend
        const userId = req.user._id;

        let cloudinaryImageUrl = null;

        // --- OPTIONAL: Upload image to Cloudinary (your existing logic) ---
        // If you want to save the user's uploaded image to Cloudinary, keep this.
        // If you only need Gemini to read it and don't want to save it permanently, you can remove this block.
        if (image) {
            const uploadedImage = await cloudinary.uploader.upload(image, {
                folder: "ai-chats",
            });
            cloudinaryImageUrl = uploadedImage.secure_url;
        }
        // --- END OPTIONAL ---

        // Use the Gemini model capable of understanding images
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // gemini-1.5-flash is good for multimodal
        // You could also use "gemini-1.5-pro" for more advanced understanding, but it might be slower/more expensive.

        const parts = [];

        // Add the text part if a question is provided
        if (question && question.trim() !== '') {
            parts.push({ text: question });
        }

        // Add the image part if an image is provided
        if (image) { // This `image` is the Base64 string from the frontend
            const mimeType = image.substring(5, image.indexOf(';')); // e.g., "image/jpeg"
            const base64Data = image.split(',')[1]; // The actual Base64 data

            parts.push({
                inlineData: {
                    mimeType: mimeType,
                    data: base64Data,
                },
            });
        }

        if (parts.length === 0) {
            return res.status(400).json({ success: false, message: "No content (text or image) provided for AI." });
        }

        const generationConfig = {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
        };

        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        // Call the Gemini API with both text and image parts
        const result = await model.generateContent({
            contents: [{ role: "user", parts: parts }],
            generationConfig,
            safetySettings,
        });

        const response = await result.response;
        const aiReply = response.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

        // Save user's question (sender: user, receiver: AI_SYSTEM_ID)
        await AI.create({
            senderId: userId,
            receiverId: AI_SYSTEM_ID,
            text: question,
            image: cloudinaryImageUrl, // Use the Cloudinary URL if uploaded, otherwise it will be null
        });

        // Save AI's reply (sender: AI_SYSTEM_ID, receiver: user)
        const aiMessage = await AI.create({
            senderId: AI_SYSTEM_ID,
            receiverId: userId,
            text: aiReply,
            // No image for AI reply in this function unless explicitly generated (from generateImageLogic)
        });

        // Emit AI reply to user via socket
        const receiverSocketId = getReceiverSocketId(userId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", {
                role: 'ai',
                content: aiMessage.text,
                image: aiMessage.image || null, // Ensure image is passed, even if null
                timestamp: aiMessage.createdAt
            });
        }

        res.status(200).json({ success: true, reply: aiReply });

    } catch (error) {
        console.error("AI logic error:", error);
        // More detailed error logging for Gemini API issues
        if (error.response && error.response.data) {
            console.error("Gemini API Error details:", error.response.data);
            if (error.response.data.error && error.response.data.error.message) {
                // Log specific error message from Google API
                console.error("Google API Error Message:", error.response.data.error.message);
                return res.status(500).json({ success: false, message: `AI processing failed: ${error.response.data.error.message}` });
            }
        }
        res.status(500).json({ success: false, message: "Something went wrong with AI processing. Please try again." });
    }
};

// --- Add the generateImageLogic function here if you removed it ---
// If you want to re-add image generation, use the 'imagen-3.0-generate-002' model as discussed,
// and remember it requires billing. I'm omitting it here to keep focus on "reading images" (multimodal chat).
// If you want to use it, uncomment and place the 'generateImageLogic' function here.


export const getChatHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const chats = await AI.find({
            $or: [
                { senderId: userId, receiverId: AI_SYSTEM_ID },
                { senderId: AI_SYSTEM_ID, receiverId: userId }
            ]
        }).sort({ createdAt: 1 });

        const formattedChats = chats.map(chat => ({
            role: chat.senderId.equals(userId) ? 'user' : 'ai',
            content: chat.text,
            image: chat.image || null,
            timestamp: chat.createdAt,
        }));

        res.status(200).json({ success: true, chats: formattedChats });
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ success: false, message: "Failed to load chat history." });
    }
};

// import AI from "../models/ai.model.js";
// import cloudinary from "../lib/cloudinary.js";
// import axios from "axios";
// import { getReceiverSocketId, io } from "../lib/socket.js";
// import mongoose from "mongoose"; // Import mongoose to work with ObjectIds

// // Define a fixed ObjectId for the AI system.
// // You should generate a valid 24-character hex string once and use it here.
// // Example: new mongoose.Types.ObjectId('60c72b2f9b2f8f2e2c000001')
// // You can get a new one by running `new mongoose.Types.ObjectId().toString()` in your Node.js console.
// const AI_SYSTEM_ID = new mongoose.Types.ObjectId("652c78f11a8c0e2a3b900000"); // <<< IMPORTANT: Replace with your chosen fixed AI_ID

// export const ailogic = async (req, res) => {
//   try {
//     const { question, image } = req.body;
//     const userId = req.user._id; // This is the ObjectId of the authenticated user

//     let imageUrl = null;

//     // Upload image if provided
//     if (image) {
//       const uploadedImage = await cloudinary.uploader.upload(image, {
//         folder: "ai-chats",
//       });
//       imageUrl = uploadedImage.secure_url;
//     }

//     // Send user question to Gemini API
//     const geminiRes = await axios.post(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//       {
//         contents: [{ parts: [{ text: question }] }],
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const aiReply =
//       geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

//     // Save user's question (sender: user, receiver: AI_SYSTEM_ID)
//     await AI.create({
//       senderId: userId,
//       receiverId: AI_SYSTEM_ID, // Use the fixed ObjectId for the AI system
//       text: question,
//       image: imageUrl,
//     });

//     // Save AI's reply (sender: AI_SYSTEM_ID, receiver: user)
//     // This ensures the message direction is correctly recorded in the database
//     const aiMessage = await AI.create({
//       senderId: AI_SYSTEM_ID, // AI is the sender
//       receiverId: userId,    // User is the receiver
//       text: aiReply,
//     });

//     // Emit AI reply to user via socket
//     const receiverSocketId = getReceiverSocketId(userId);
//     if (receiverSocketId) {
//       // Emit the AI's message to the user's socket
//       io.to(receiverSocketId).emit("newMessage", aiMessage);
//     }

//     // Send AI reply back to frontend
//     res.status(200).json({ success: true, reply: aiReply });
//   } catch (error) {
//     console.error("AI logic error:", error.message);
//     res.status(500).json({ success: false, message: "Something went wrong." });
//   }
// };


// export const getChatHistory = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     // console.log("getChatHistory: Fetching chat history for User ID:", userId ? userId.toString() : "undefined");
//     // console.log("getChatHistory: AI System ID:", AI_SYSTEM_ID.toString());
//     // Fetch all chats involving this user and the AI_SYSTEM_ID
//     // This query retrieves both user's questions to AI and AI's replies to the user
//     const chats = await AI.find({
//       $or: [
//         { senderId: userId, receiverId: AI_SYSTEM_ID }, // Messages from user to AI
//         { senderId: AI_SYSTEM_ID, receiverId: userId }  // Messages from AI to user
//       ]
//     }).sort({ createdAt: 1 }); // Sort by creation date to maintain conversation order

//     // Format for frontend:
//     // Determine the role ('user' or 'ai') based on who the sender is
//     const formattedChats = chats.map(chat => ({
//       // Use .equals() for robust comparison of ObjectId instances
//       role: chat.senderId.equals(userId) ? 'user' : 'ai',
//       content: chat.text,
//       image: chat.image || null, // Include image if it exists
//       timestamp: chat.createdAt, // Include timestamp for display purposes
//     }));

//     res.status(200).json({ success: true, chats: formattedChats });
//   } catch (error) {
//     console.error("Error fetching chat history:", error);
//     res.status(500).json({ success: false, message: "Failed to load chat history." });
//   }
// };