import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./presentation/routes/authRoutes";
import userRoutes from "./presentation/routes/userRoutes";
import errorMiddleware from "./presentation/middlewares/errorMiddleware";
import "./di/diContainer";
import swaggerUi from "swagger-ui-express";
import swaggerSpecs from "./swagger/config/swagger";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json()); // json 포맷을 해독하기 위해 사용하는 미들웨어
app.use(express.urlencoded({ extended: true })); // x-www-form-urlencoded 포맷을 해독하기 위해 사용하는 미들웨어

/** health check api */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/** swagger document */
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    explorer: true, // 검색창 활성화 여부
  })
);

/** api */
const router = express.Router();
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
app.use("/api/v1", router);

/** error handler */
app.use(errorMiddleware);

/** server start */
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
