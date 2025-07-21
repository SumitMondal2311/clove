import { Request } from "express";

export const getIP = (req: Request) => {
    return req.ip === "::1" ? "127.0.0.1" : req.ip;
};
