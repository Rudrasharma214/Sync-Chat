import { generatetoken } from "../lib/utils.js";
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js"

export const signup = async (req, res) => {
    const { fullname, email, password } = req.body;
    try {
        if (!fullname || !email || !password) {
            return res.status(400).json({ message: "Name Email and Password required." })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be atleast 6 character." })
        }

        const user = await User.findOne({ email })

        if (user) return res.status(400).json({ message: "Email already exists" })

        const salt = await bcrypt.genSalt(10)
        const hashP = await bcrypt.hash(password, salt)

        const newuser = new User({
            fullname: fullname,
            email: email,
            password: hashP
        })
        if (newuser) {
            generatetoken(newuser._id, res)
            await newuser.save()

            res.status(201).json({
                _id: newuser._id,
                fullname: newuser.fullname,
                email: newuser.email,
                profilepic: newuser.profilepic,
            })
        } else {
            return res.status(400).json({ message: "Invalid user data" })
        }


    } catch (e) {
        console.log("error in signup authController", e.message)
        return res.status(500).json({ message: "Internal server error" })
    }
}
export const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const ispass = await bcrypt.compare(password, user.password)

        if(!ispass) return res.status(400).json({ message: "Invalid credentials" })
        
        generatetoken(user._id , res) 

        res.status(200).json({
            _id : user._id,
            fullname: user.fullname,
            email: user.email,
            profilepic: user.profilepic,
        })
    } catch (e) {
        console.log("error in login authController", e.message)
        return res.status(500).json({ message: "Internal server error" })
    }
}
export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge:0})
        res.status(200).json({message : "Logout succcessfully"})
    } catch (e) {
        console.log("error in logout authController", e.message)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const updateProfile = async (req, res) => {
    try {
        const {profilepic} = req.body
        const userId = req.user._id

        if(!userId) {
            return res.status(400).json({ message: "Profile Pic is required." })
        }

        const uploadResponse = await cloudinary.uploader.upload(profilepic) 

        const updateduser = await User.findByIdAndUpdate(userId,{
            profilepic : uploadResponse.secure_url
        },{new:true})

        res.status(200).json(updateduser)
    } catch (e) {
        console.log("error in updateProfile authController", e.message)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const checkAuth = async (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (e) {
        console.log("error in chectAuth authController", e.message)
        return res.status(500).json({ message: "Internal server error" })
    }
}