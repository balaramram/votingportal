import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/UserModel.js";
import { AdminModel } from "../models/AdminModel.js";
import { AppError } from "../middleware/log-error-handler/logemodule.js";

// Admin registration function
export const adminRegister = async (req, res, next) => {
  const { email, password, department } = req.body;
  try {
    const existingAdmin = await AdminModel.findOne({ email });
    if (existingAdmin) {
      return next(new AppError("Admin already exists", 400));
    }
    const admin = new AdminModel({ email, password, department });
    await admin.save();
    res
      .status(201)
      .json({ success: true, message: "Admin registered successfully" });
  } catch (error) {
    return next(new AppError("Server error", 500));
  }
};

// Admin login function
export const adminLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      return next(new AppError("Admin not found", 404));
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return next(new AppError("Invalid credentials", 401));
    }
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    // Set token as HTTP-only cookie so frontend doesn't need to store it in JS
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    res.status(200).json({ success: true, token });
  } catch (error) {
    return next(new AppError("Server error", 500));
  }
};

// User login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password, fingerprintData,  } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError("Invalid credentials", 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError("Invalid credentials", 401));
    }


    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });
    // Set token as HTTP-only cookie so frontend doesn't need to store it in JS
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
    });
    res.status(200).json({ 
      success: true, 
      token, 
      userId: user._id,
      faceData: user.faceData,
      message: "Password verified. Please proceed to Face Scan."
    });

  } catch (error) {
    return next(new AppError("Server error", 500));
  }
};
