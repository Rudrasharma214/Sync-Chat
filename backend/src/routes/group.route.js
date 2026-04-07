import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import * as groupController from "../controllers/group.controller.js";

const router = express.Router();

/**
 * @route POST /api/groups
 * @desc Create a new group
 * @access Private
 */
router.post("/", authenticate, groupController.createGroup);

/**
 * @route GET /api/groups
 * @desc Get all groups for authenticated user
 * @access Private
 */
router.get("/", authenticate, groupController.getMyGroups);

/**
 * @route GET /api/groups/:groupId
 * @desc Get group by ID
 * @access Private
 */
router.get("/:groupId", authenticate, groupController.getGroupById);

/**
 * @route PATCH /api/groups/:groupId
 * @desc Update group details
 * @access Private (admin/owner)
 */
router.patch("/:groupId", authenticate, groupController.updateGroup);

/**
 * @route DELETE /api/groups/:groupId
 * @desc Delete a group
 * @access Private (owner)
 */
router.delete("/:groupId", authenticate, groupController.deleteGroup);

/**
 * @route POST /api/groups/:groupId/members
 * @desc Add members to a group
 * @access Private (admin/owner)
 */
router.post("/:groupId/members", authenticate, groupController.addMembers);

/**
 * @route DELETE /api/groups/:groupId/members/:memberId
 * @desc Remove a member from a group
 * @access Private (admin/owner)
 */
router.delete("/:groupId/members/:memberId", authenticate, groupController.removeMember);

/**
 * @route PATCH /api/groups/:groupId/members/:memberId/role
 * @desc Update group member role
 * @access Private (owner)
 */
router.patch("/:groupId/members/:memberId/role", authenticate, groupController.updateMemberRole);

export default router;
