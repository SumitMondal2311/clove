import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authRouter } from "./auth.route.js";
import { healthRouter } from "./health.route.js";
import { userRouter } from "./user.route.js";

export const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/user", authMiddleware, userRouter);
