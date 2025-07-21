import { Router } from "express";
import { login, logout, refreshToken, signup } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { handleAsync } from "../utils/handle-async";

export const authRouter = Router();

authRouter.post("/signup", handleAsync(signup));
authRouter.post("/login", handleAsync(login));
authRouter.post("/refresh-token", handleAsync(refreshToken));

authRouter.use(authMiddleware);

authRouter.post("/logout", handleAsync(logout));
