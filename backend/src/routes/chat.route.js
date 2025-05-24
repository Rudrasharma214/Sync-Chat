import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { getMessages, getuserforlist, sendMessage } from "../controllers/chat.controller.js"


const router = express.Router()

router.get("/users",protectRoute, getuserforlist)
router.get("/:id",protectRoute,getMessages)
router.post("/send/:id",protectRoute,sendMessage)
export default router