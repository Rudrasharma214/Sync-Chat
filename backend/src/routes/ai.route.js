import express from "express";
import { ailogic,getChatHistory } from "../controllers/ai.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();


router.post("/ai", protectRoute, ailogic);
router.get("/history", protectRoute, getChatHistory);

export default router;
