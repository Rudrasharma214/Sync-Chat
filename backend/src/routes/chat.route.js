import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
    getMessages, 
    getuserforlist, 
    sendMessage,
    deleteMessage // <--- Import the new deleteMessage controller
} from "../controllers/chat.controller.js"; // Ensure deleteMessage is exported from here


const router = express.Router();

router.get("/users", protectRoute, getuserforlist);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

// New route for deleting a message
// This route expects a message ID as a parameter
router.delete("/messages/:id", protectRoute, deleteMessage); // <--- Add this new route

export default router;


// import express from "express"
// import { protectRoute } from "../middleware/auth.middleware.js"
// import { getMessages, getuserforlist, sendMessage } from "../controllers/chat.controller.js"


// const router = express.Router()

// router.get("/users",protectRoute, getuserforlist)
// router.get("/:id",protectRoute,getMessages)
// router.post("/send/:id",protectRoute,sendMessage)
// export default router