import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./presentation/routes/authRoutes";
import errorMiddleware from "./presentation/middlewares/errorMiddleware";
import "./di/diContainer";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json()); // json 포맷을 해독하기 위해 사용하는 미들웨어
app.use(express.urlencoded({ extended: true })); // x-www-form-urlencoded 포맷을 해독하기 위해 사용하는 미들웨어

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

const router = express.Router();
router.use("/auth", authRoutes);

app.use("/api/v1", router);

app.use(errorMiddleware);

app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server is running on port ${port}`);
});
