import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @route POST /api/auth/signup
 * @desc Register a new user
 * @access Public
 */
router.post("/signup", authController.signup);

/**
 * @route POST /api/auth/login
 * @desc Login an existing user
 * @access Public
 */
router.post("/login", authController.login);

/**
 * @route POST /api/auth/logout
 * @desc Logout the current user
 * @access Private
 */
router.post("/logout", authenticate, authController.logout);

/**
 * @route POST /api/auth/refresh-token
 * @desc Refresh access token using refresh token
 * @access Private
 */
router.post("/refresh-token", authController.refreshToken);

export default router;


