import { Router } from "express";
import { signupController, verifyEmailController } from "../controllers/auth/index.js";
import { handleAsync } from "../utils/handle-async.js";

export const authRouter = Router();

authRouter.post("/signup", handleAsync(signupController));
authRouter.post("/verify-email", handleAsync(verifyEmailController));
