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
 * @access Public (uses refresh token cookie)
 */
router.post("/refresh-token", authController.refreshToken);

/**
 * @route PATCH /api/auth/change-password
 * @desc Change password for authenticated user
 * @access Private
 */
router.patch("/change-password", authenticate, authController.changePassword);

/**
 * @route GET /api/auth/me
 * @desc Get current authenticated user profile
 * @access Private
 */
router.get("/me", authenticate, authController.getMe);

/**
 * @route GET /api/auth/users/search
 * @desc Search users by name or email (excluding current user)
 * @access Private
 */
router.get("/users/search", authenticate, authController.searchUsers);

export default router;


