import { Router } from "express";
import { signup } from "../controllers/auth-controller.js";
import { handleAsync } from "../utils/handle-async.js";

export const authRouter = Router();

authRouter.post("/signup", handleAsync(signup));
