import { Router } from "express";
import { adminLogin, loginUser } from "../controller/authController.js";

const router = Router();

// Admin login route
router.post("/admin/login", adminLogin);

// User login route
router.post("/user/login", loginUser);

export default router;
