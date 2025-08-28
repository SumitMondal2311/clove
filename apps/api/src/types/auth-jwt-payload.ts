import { JWTPayload } from "jose";

export interface AuthJWTPayload extends JWTPayload {
    type?: "access" | "refresh";
    session_id?: string;
}
