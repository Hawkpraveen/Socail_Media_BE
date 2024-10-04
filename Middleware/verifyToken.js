import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import user from "../Models/userModel.js";
dotenv.config();

export const authUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    //console.log('Decoded token payload:', decoded);

    const userDetails = await user.findById(decoded.id);

    //console.log(user);
    req.user = userDetails;
    next();
  } catch (error) {
    //console.error(error);
    res.status(401).json({ message: "Unauthorized" });
  }
};
