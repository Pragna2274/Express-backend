import mongoose from "mongoose";
import { USER_ROLES } from "../types/role";
 
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
 
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
 
  passwordHash: {
    type: String,
    required: true,
  },
 
  role: {
    type: String,
    enum: USER_ROLES, // ✅ now ACTUALLY used
    default: "user",
    required: true,
  },
 
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
 
export const UserModel =
  mongoose.models.User || mongoose.model("User", UserSchema);