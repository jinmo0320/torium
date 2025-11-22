import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import errorMiddleware from "./middlewares/errorMiddleware";
import "./di/diContainer";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
); // CORS 설정
app.use(express.json()); // json 포맷을 해독하기 위해 사용하는 미들웨어
app.use(express.urlencoded({ extended: true })); // x-www-form-urlencoded 포맷을 해독하기 위해 사용하는 미들웨어

app.use("/auth", authRoutes);

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`
    🎉 Server is running on port ${port}
    🎉 http://localhost:${port}
    `);
});
