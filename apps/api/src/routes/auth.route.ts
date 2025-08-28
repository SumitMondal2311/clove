import { Router } from "express";
import { signupController } from "../controllers/auth/signup.controller.js";
import { handleAsync } from "../utils/handle-async.js";

export const authRouter = Router();

authRouter.post("/signup", handleAsync(signupController));
