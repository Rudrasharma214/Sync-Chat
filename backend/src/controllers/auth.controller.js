import * as userService from "../services/user.service.js"
import STATUS from "../constant/statusCodes.js";
import { sendResponse, sendErrorResponse } from '../utils/response.js'
import env from "../config/env.js";
 
export const signup = async (req, res, next) => {
    try{
        const {fullname, email, password} = req.body
        if(!fullname || !email || !password) {
            return sendErrorResponse(res, STATUS.BAD_REQUEST, "All fields are required.")
        }

        const result = await userService.createUser({fullname, email, password})

        if(!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        return sendResponse(res, STATUS.CREATED, "User created successfully", result.data)
    } catch (error) {
        next(error);
    }
}

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return sendErrorResponse(res, STATUS.BAD_REQUEST, "Email and password are required.");
        }

        const result = await userService.loginUser({ email, password });

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        res.cookie("accessToken", result.data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: env.JWT_ACCESS_EXPIRES_IN 
        });

        res.cookie("refreshToken", result.data.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: env.JWT_REFRESH_EXPIRES_IN 
        });

        return sendResponse(res, STATUS.OK, "Login successful", res.data.user);
    } catch (error) {
        next(error);
    }
};

// ✅ Step 2: Verify OTP and Login
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (
      !user ||
      user.otp !== otp ||
      !user.otpExpiry ||
      user.otpExpiry < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    generatetoken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      profilepic: user.profilepic,
    });
  } catch (error) {
    console.log("OTP verify error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


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