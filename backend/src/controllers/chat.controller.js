import cloudinary from "../lib/cloudinary.js"
import Message from "../models/message.model.js"
import User from "../models/user.model.js"
import mongoose from "mongoose"
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getuserforlist = async (req, res) => {
    try {
        const loggedinuserId = req.user._id
        const filtereduser = await User.find({ _id: { $ne: loggedinuserId } }).select("-password")

        res.status(200).json(filtereduser)

    } catch (e) {
        console.log("error in getuserforlist chatController", e.message)
        return res.status(500).json({ message: "Internal server error" })
    }
}


export const getMessages = async (req, res) => {
    try {
        const { id: usertochatId } = req.params
        const myId = req.user._id;

        // Validate ObjectIds
        if (!mongoose.Types.ObjectId.isValid(usertochatId) || !mongoose.Types.ObjectId.isValid(myId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: usertochatId },
                { senderId: usertochatId, receiverId: myId }
            ]
        })

        res.status(200).json(messages)
    } catch (e) {
        console.log("error in getMessages chatController", e.message)
        return res.status(500).json({ message: "Internal server error" })
    }
}


export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body
        const { id: receiverId } = req.params
        const senderId = req.user._id

        let imageURL;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageURL = uploadResponse.secure_url
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageURL
        })
        await newMessage.save()

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (e) {
        console.log("error in sendMessage chatController", e.message)
        return res.status(500).json({ message: "Internal server error" })
    }
}