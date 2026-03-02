import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../types/role";
 
interface TokenPayload {
  sub: string;
  role: UserRole;
  iat: number;
  exp: number;
}
 
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
 
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authorization token missing",
    });
  }
 
  const token = authHeader.split(" ")[1];
  const JWT_SECRET = process.env.JWT_SECRET;
 
  if (!JWT_SECRET) {
    return res.status(500).json({
      message: "JWT secret not configured",
    });
  }
 
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
 
    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };
 
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
 