import { Router } from "express";
import { loginUser, registerUser, refresh, logout } from "../controllers/authController";
 
const router = Router();
 
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refresh);
router.post("/logout", logout);
 
export default router;