import crypto from "crypto";
 
// generate opaque random token
export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString("hex"); // 128 hex chars
};
 
// hash before storing
export const hashRefreshToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};