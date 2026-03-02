import { z } from "zod";
 
export const registerSchema = z.object({
  name: z.string().min(1).trim(),
  email: z.string().email().trim(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email().trim(),
  password: z.string().min(1),
});