import { Router } from "express";
import {
    loginController,
    logoutController,
    signupController,
    verifyEmailController,
} from "../controllers/auth/index.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { handleAsync } from "../utils/handle-async.js";

export const authRouter = Router();

authRouter.post("/signup", handleAsync(signupController));
authRouter.post("/verify-email", handleAsync(verifyEmailController));
authRouter.post("/login", handleAsync(loginController));

authRouter.use(authMiddleware);

authRouter.post("/logout", handleAsync(logoutController));
