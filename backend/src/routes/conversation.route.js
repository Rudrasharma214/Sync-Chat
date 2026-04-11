import express from "express";
import * as conversationController from "../controllers/conversation.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @route POST /api/conversations/direct
 * @desc Create or get direct conversation between two users
 * @access Private
 */
router.post("/direct", authenticate, conversationController.createOrGetDirectConversation);

/**
 * @route GET /api/conversations
 * @desc Get all conversations (direct + group) for authenticated user
 * @access Private
 */
router.get("/", authenticate, conversationController.getAllConversations);

/**
 * @route GET /api/conversations/:conversationId
 * @desc Get conversation by ID
 * @access Private
 */
router.get("/:conversationId", authenticate, conversationController.getConversation);

/**
 * @route DELETE /api/conversations/:conversationId
 * @desc Delete a direct conversation and all of its messages
 * @access Private
 */
router.delete("/:conversationId", authenticate, conversationController.deleteConversation);

export default router;
