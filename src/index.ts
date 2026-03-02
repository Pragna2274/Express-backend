import express, { Request, Response } from "express";
import dotenv from "dotenv";
import taskRouter from "./routes/taskRoutes";
import connectDB from "./connection";
import authRouter from "./routes/authRoutes";

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Todo API is running" });
});
app.use("/auth", authRouter);
app.use("/tasks", taskRouter);

// 🔥 START SERVER ONLY AFTER DB CONNECTS
const startServer = async () => {
  try {
    await connectDB(); // ⬅️ WAIT here
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server", error);
    process.exit(1);
  }
};

startServer();