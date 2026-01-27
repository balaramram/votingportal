import User from "../models/UserModel.js";
import { AppError } from "../middleware/log-error-handler/logemodule.js";

// User registration
export const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      dob,
      fingerprintData,
      faceData,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("User already exists", 400));
    }

    if (faceData) {
      const currentDescriptor = JSON.parse(faceData);
      const allUsers = await User.find({}, "faceData");

      for (let user of allUsers) {
        if (user.faceData) {
          const savedDescriptor = JSON.parse(user.faceData);
          const distance = Math.sqrt(
            currentDescriptor.reduce((sum, val, i) => sum + Math.pow(val - savedDescriptor[i], 2), 0)
          );

          // Distance 0.45 kulla irundha, adhu "Existing User" dhaan
          if (distance < 0.45) {
            return next(new AppError("Face already registered with another account!", 400));
          }
        }
      }
    }

    const newUser = new User({
      name,
      email,
      password,
      dob,
      fingerprintData,
      faceData,
      department,
      year,
      batch,
    });

    await newUser.save();
    res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    return next(new AppError("Error registering user", 500));
  }
};

// Get user profile
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    return next(new AppError("Server error", 500));
  }
};

// Get user profile
export const getAllUserProfiles = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    if (!users) {
      return next(new AppError("User not found", 404));
    }
    res.status(200).json({ success: true, users });
  } catch (error) {
    return next(new AppError("Server error", 500));
  }
};
