import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import * as messageController from "../controllers/message.controller.js";

const router = express.Router();

/**
 * @route POST /api/messages
 * @desc Send message
 * @access Private
 */
router.post("/", authenticate, messageController.sendMessage);

/**
 * @route GET /api/messages/:conversationId
 * @desc Get paginated messages by conversation
 * @access Private
 */
router.get("/:conversationId", authenticate, messageController.getMessagesByConversation);

/**
 * @route PATCH /api/messages/:messageId
 * @desc Update message content (within 2 hours)
 * @access Private
 */
router.patch("/:messageId", authenticate, messageController.updateMessage);

/**
 * @route DELETE /api/messages/:messageId
 * @desc Delete message for me/everyone
 * @access Private
 */
router.delete("/:messageId", authenticate, messageController.deleteMessage);

export default router;
