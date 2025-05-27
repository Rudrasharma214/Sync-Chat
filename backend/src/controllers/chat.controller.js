import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getuserforlist = async (req, res) => {
    try {
        const loggedinuserId = req.user._id;
        const filtereduser = await User.find({ _id: { $ne: loggedinuserId } }).select("-password");

        res.status(200).json(filtereduser);

    } catch (e) {
        console.log("error in getuserforlist chatController", e.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const getMessages = async (req, res) => {
    try {
        const { id: usertochatId } = req.params;
        const myId = req.user._id;

        // Validate ObjectIds
        if (!mongoose.Types.ObjectId.isValid(usertochatId) || !mongoose.Types.ObjectId.isValid(myId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        // Fetch messages directly from the Message collection
        // This query finds all messages where:
        // (sender is me AND receiver is other user) OR (sender is other user AND receiver is me)
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: usertochatId },
                { senderId: usertochatId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 }); // Sort by creation time to ensure correct order

        res.status(200).json(messages);
    } catch (e) {
        console.log("error in getMessages chatController", e.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params; // This is the ID of the user receiving the message
        const senderId = req.user._id; // This is the ID of the authenticated user sending the message

        let imageURL;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageURL = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageURL,
        });

        await newMessage.save(); // Save the new message

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            // Emit the new message to the receiver
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (e) {
        console.log("error in sendMessage chatController", e.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// New: Controller function to delete a message
export const deleteMessage = async (req, res) => {
    try {
        const { id: messageId } = req.params; // Get the message ID from URL parameters
        const userId = req.user._id; // Get the ID of the authenticated user (the one trying to delete)

        // 1. Find the message by its ID
        const message = await Message.findById(messageId);

        // 2. Check if the message exists
        if (!message) {
            return res.status(404).json({ message: "Message not found." });
        }

        // 3. Verify that the authenticated user is the sender of the message
        // Only the sender should be able to delete a message for everyone.
        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this message." });
        }

        // Store receiverId for socket emission before deleting the message
        const receiverId = message.receiverId;
        const senderId = message.senderId; // Also need senderId for socket logic

        // 4. Delete the message from the Message collection
        await Message.deleteOne({ _id: messageId });

        // 5. Emit a socket event to notify the other participant in the conversation
        // The other participant is either the receiver (if I'm the sender) or the sender (if I'm the receiver).
        const otherParticipantId = (receiverId.toString() === userId.toString()) ? senderId : receiverId;

        if (otherParticipantId) {
            const otherParticipantSocketId = getReceiverSocketId(otherParticipantId);
            if (otherParticipantSocketId) {
                // Emit to the other participant's socket that a message was deleted.
                // We also send the senderId (which is `userId` in this context) and receiverId
                // so the frontend can determine if it's relevant to their current chat.
                io.to(otherParticipantSocketId).emit("messageDeleted", { 
                    messageId, 
                    senderId: senderId.toString(), // Original sender of the message
                    receiverId: receiverId.toString() // Original receiver of the message
                });
            }
        }

        res.status(200).json({ message: "Message deleted successfully for everyone." });

    } catch (error) {
        console.error("Error in deleteMessage chatController:", error.message);
        return res.status(500).json({ message: "Internal server error." });
    }
};


// import cloudinary from "../lib/cloudinary.js"
// import Message from "../models/message.model.js"
// import User from "../models/user.model.js"
// import mongoose from "mongoose"
// import { getReceiverSocketId, io } from "../lib/socket.js";

// export const getuserforlist = async (req, res) => {
//     try {
//         const loggedinuserId = req.user._id
//         const filtereduser = await User.find({ _id: { $ne: loggedinuserId } }).select("-password")

//         res.status(200).json(filtereduser)

//     } catch (e) {
//         console.log("error in getuserforlist chatController", e.message)
//         return res.status(500).json({ message: "Internal server error" })
//     }
// }


// export const getMessages = async (req, res) => {
//     try {
//         const { id: usertochatId } = req.params
//         const myId = req.user._id;

//         // Validate ObjectIds
//         if (!mongoose.Types.ObjectId.isValid(usertochatId) || !mongoose.Types.ObjectId.isValid(myId)) {
//             return res.status(400).json({ message: "Invalid user ID" });
//         }

//         const messages = await Message.find({
//             $or: [
//                 { senderId: myId, receiverId: usertochatId },
//                 { senderId: usertochatId, receiverId: myId }
//             ]
//         })

//         res.status(200).json(messages)
//     } catch (e) {
//         console.log("error in getMessages chatController", e.message)
//         return res.status(500).json({ message: "Internal server error" })
//     }
// }


// export const sendMessage = async (req, res) => {
//     try {
//         const { text, image } = req.body
//         const { id: receiverId } = req.params
//         const senderId = req.user._id

//         let imageURL;
//         if (image) {
//             const uploadResponse = await cloudinary.uploader.upload(image)
//             imageURL = uploadResponse.secure_url
//         }

//         const newMessage = new Message({
//             senderId,
//             receiverId,
//             text,
//             image: imageURL
//         })
//         await newMessage.save()

//         const receiverSocketId = getReceiverSocketId(receiverId);
//         if (receiverSocketId) {
//             io.to(receiverSocketId).emit("newMessage", newMessage);
//         }

//         res.status(201).json(newMessage);
//     } catch (e) {
//         console.log("error in sendMessage chatController", e.message)
//         return res.status(500).json({ message: "Internal server error" })
//     }
// }