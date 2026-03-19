import * as userService from "../services/user.service.js"
import STATUS from "../constant/statusCodes.js";
import { sendResponse, sendErrorResponse } from '../utils/response.js'
 
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
    } catch (e) {
        next(e)
    }
}
// export const login = async (req, res) => {
//     const { email, password } = req.body
//     try {
//         const user = await User.findOne({ email })
//         if (!user) {
//             return res.status(400).json({ message: "Invalid credentials" })
//         }

//         const ispass = await bcrypt.compare(password, user.password)

//         if(!ispass) return res.status(400).json({ message: "Invalid credentials" })
        
//         generatetoken(user._id , res) 

//         res.status(200).json({
//             _id : user._id,
//             fullname: user.fullname,
//             email: user.email,
//             profilepic: user.profilepic,
//         })
//     } catch (e) {
//         console.log("error in login authController", e.message)
//         return res.status(500).json({ message: "Internal server error" })
//     }
// }

// ✅ Step 1: Login - verify email & password, send OTP
export const verifyPasswordAndSendOtp = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    console.log(`OTP for ${email} :-`, otp);
    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();

    // Send OTP to user's email
    await sendEmail(user.email, "Login OTP", `Your OTP is ${otp}`);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.log("Login error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
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