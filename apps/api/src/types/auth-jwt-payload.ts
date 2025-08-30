import { JWTPayload } from "jose";

export interface AuthJWTPayload extends JWTPayload {
    sid?: string;
    typ?: "access" | "refresh";
}
