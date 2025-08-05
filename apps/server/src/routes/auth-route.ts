import { Router } from "express";
import { login, signup } from "../controllers/auth-controller.js";
import { handleAsync } from "../utils/handle-async.js";

export const authRouter = Router();

authRouter.post("/signup", handleAsync(signup));
authRouter.post("/login", handleAsync(login));
