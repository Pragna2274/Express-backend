import jwt from "jsonwebtoken";
import { UserRole } from "../types/role";
 
export interface JwtPayload {
  sub: string; // userId
  role: UserRole;
}

export const signAccessToken = (payload: JwtPayload): string => {
  const JWT_SECRET = process.env.JWT_SECRET;
 
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
 
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "15m",
  });
};