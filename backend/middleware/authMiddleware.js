import jwt from "jsonwebtoken";
import { AdminModel } from "../models/AdminModel.js";

const protectRoute = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(" ")[1];
    // fallback to cookie if Authorization header not provided
    if (!token && req.cookies) token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await AdminModel.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export { protectRoute };
