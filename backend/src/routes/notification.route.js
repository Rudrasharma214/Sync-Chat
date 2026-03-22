import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import * as notificationController from "../controllers/notification.controller.js";

const router = express.Router();

/**
 * @route GET /api/notifications/preferences
 * @desc Get notification preferences for authenticated user
 * @access Private
 */
router.get("/preferences", authenticate, notificationController.getPreferences);

/**
 * @route PUT /api/notifications/preferences
 * @desc Create or update notification preferences for authenticated user
 * @access Private
 */
router.put("/preferences", authenticate, notificationController.updatePreferences);

/**
 * @route PATCH /api/notifications/preferences/toggle
 * @desc Toggle notification state for authenticated user
 * @access Private
 */
router.patch("/preferences/toggle", authenticate, notificationController.toggleNotifications);

/**
 * @route DELETE /api/notifications/preferences
 * @desc Delete notification preferences for authenticated user
 * @access Private
 */
router.delete("/preferences", authenticate, notificationController.deletePreferences);

/**
 * @route GET /api/notifications/unread-summary
 * @desc Get unread notifications summary for authenticated user
 * @access Private
 */
router.get("/unread-summary", authenticate, notificationController.getUnreadSummary);

export default router;
