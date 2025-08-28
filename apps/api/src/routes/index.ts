import { Router } from "express";
import { authRouter } from "./auth.route.js";
import { healthRouter } from "./health.route.js";

export const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
