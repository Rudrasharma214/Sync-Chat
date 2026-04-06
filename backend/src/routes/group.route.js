import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import * as groupController from "../controllers/group.controller.js";

const router = express.Router();

router.post("/", authenticate, groupController.createGroup);
router.get("/", authenticate, groupController.getMyGroups);
router.get("/:groupId", authenticate, groupController.getGroupById);
router.patch("/:groupId", authenticate, groupController.updateGroup);
router.delete("/:groupId", authenticate, groupController.deleteGroup);
router.post("/:groupId/members", authenticate, groupController.addMembers);
router.delete("/:groupId/members/:memberId", authenticate, groupController.removeMember);
router.patch("/:groupId/members/:memberId/role", authenticate, groupController.updateMemberRole);

export default router;
