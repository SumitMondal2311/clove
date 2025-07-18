import { Router } from "express";
import { login, signup } from "../controllers/auth.controller";
import { handleAsync } from "../utils/handle-async";

export const authRouter = Router();

authRouter.post("/signup", handleAsync(signup));
authRouter.post("/login", handleAsync(login));
