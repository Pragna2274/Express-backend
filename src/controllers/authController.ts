import { Request, Response } from "express";
import { ZodError } from "zod";
import { registerSchema } from "../schemas/authSchemas";
import { UserModel } from "../models/User";
import { hashPassword } from "../utils/password";
import { loginSchema } from "../schemas/authSchemas";
import { comparePassword } from "../utils/password";
import { signAccessToken } from "../utils/jwt";
import {
  generateRefreshToken,
  hashRefreshToken,
} from "../utils/refreshToken";
import { RefreshTokenModel } from "../schemas/refreshTokenSchema";
import { REFRESH_TOKEN_TTL_DAYS } from "../config/auth";
 
 
const formatZodError = (error: ZodError): string =>
  error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ");
 
export const registerUser = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
 
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: formatZodError(parsed.error),
      });
    }
 
    const { name, email, password } = parsed.data;
 
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }
 
    const passwordHash = await hashPassword(password);
 
    const user = await UserModel.create({
      name,
      email,
      passwordHash,
      role: "user",
    });
 
    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("❌ REGISTER FAILED", error);
    return res.status(500).json({
      message: "Failed to register user",
    });
  }
};
 

// POST /auth/login
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
 
  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
 
  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
 
  // 1️⃣ issue access token (same as before)
  const accessToken = signAccessToken({
    sub: user._id.toString(),
    role: user.role,
  });
 
  // 2️⃣ generate refresh token (opaque)
  const refreshToken = generateRefreshToken();
 
  // 3️⃣ hash refresh token before storing
  const refreshTokenHash = hashRefreshToken(refreshToken);
 
  // 4️⃣ store refresh token in DB
  await RefreshTokenModel.create({
    userId: user._id,
    tokenHash: refreshTokenHash,
    expiresAt: new Date(
      Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
    ),
  });
 
  // 5️⃣ return both tokens
  res.json({
    accessToken,
    refreshToken,
  });
};
 
/////

// POST /auth/logout
export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
 
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token required" });
  }
 
  const refreshTokenHash = hashRefreshToken(refreshToken);
 
  const tokenDoc = await RefreshTokenModel.findOne({
    tokenHash: refreshTokenHash,
    revoked: false,
  });
 
  if (!tokenDoc) {
    // idempotent logout: already logged out or invalid
    return res.status(200).json({ message: "Logged out" });
  }
 
  tokenDoc.revoked = true;
  await tokenDoc.save();
 
  return res.status(200).json({ message: "Logged out" });
};
 
/////refresh
 
// POST /auth/refresh
export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
 
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token required" });
  }
 
  const refreshTokenHash = hashRefreshToken(refreshToken);
 
  // 1️⃣ Find valid refresh token
  const tokenDoc = await RefreshTokenModel.findOne({
    tokenHash: refreshTokenHash,
    revoked: false,
    expiresAt: { $gt: new Date() },
  });
 
  if (!tokenDoc) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
 
  // 2️⃣ Load user
  const user = await UserModel.findById(tokenDoc.userId);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
 
  // 3️⃣ Rotate refresh token (revoke old one)
  tokenDoc.revoked = true;
  await tokenDoc.save();
 
  // 4️⃣ Issue new refresh token
  const newRefreshToken = generateRefreshToken();
  const newRefreshTokenHash = hashRefreshToken(newRefreshToken);
 
  await RefreshTokenModel.create({
    userId: user._id,
    tokenHash: newRefreshTokenHash,
    expiresAt: new Date(
      Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
    ),
  });
 
  // 5️⃣ Issue new access token
  const newAccessToken = signAccessToken({
    sub: user._id.toString(),
    role: user.role,
  });
 
  // 6️⃣ Return rotated tokens
  return res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
};
 