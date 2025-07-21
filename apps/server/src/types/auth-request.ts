import { Request } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    data?: {
        access?: {
            jti: string;
            exp: jwt.SignOptions["expiresIn"];
        };
        userId?: string;
        sessionId?: string;
    };
}
