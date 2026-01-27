import { Router } from "express";
import {
  registerUser,
  getUserProfile,
  getAllUserProfiles,
} from "../controller/userController.js";
import { protectUser } from "../middleware/userAuthMiddleware.js";
import { adminRegister } from "../controller/authController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
const router = Router();

// Admin registration route
router.post("/admin/register", adminRegister);

// User registration route
router.post("/register", registerUser);

// Get user profile route
router.get("/profile", protectUser, getUserProfile);

// Get all user profiles route
router.get("/profiles", protectRoute, getAllUserProfiles);

export default router;
