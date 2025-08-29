import { JWTPayload } from "jose";

export interface AuthJWTPayload extends JWTPayload {
    session_id?: string;
    type?: "access" | "refresh";
    email?: string;
}
