import { Router } from "express";
import { meController } from "../controllers/user/me.controller.js";
import { handleAsync } from "../utils/handle-async.js";

export const userRouter = Router();

userRouter.get("/me", handleAsync(meController));
