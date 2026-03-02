import mongoose from "mongoose";
 
const RefreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
 
  tokenHash: {
    type: String,
    required: true,
    unique: true,
  },
 
  expiresAt: {
    type: Date,
    required: true,
  },
 
  revoked: {
    type: Boolean,
    default: false,
  },
 
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
 
export const RefreshTokenModel =
  mongoose.models.RefreshToken ||
  mongoose.model("RefreshToken", RefreshTokenSchema);