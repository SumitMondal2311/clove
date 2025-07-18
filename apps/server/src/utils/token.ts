import jwt from "jsonwebtoken";
import {
    ACCESS_TOKEN_EXPIRES_IN,
    AUTH_PUBLIC_KEY,
    AUTH_SECRET_KEY,
    REFRESH_TOKEN_EXPIRES_IN,
} from "../configs/constant";

export const getRefreshToken = (sub: string | number, sid: Base64URLString) => {
    return jwt.sign(
        {
            sub,
            sid,
            type: "refresh",
        },
        AUTH_SECRET_KEY,
        {
            expiresIn: REFRESH_TOKEN_EXPIRES_IN,
            algorithm: "RS256",
        }
    );
};

export const getAccessToken = (sub: string | number) => {
    return jwt.sign(
        {
            sub,
            type: "access",
        },
        AUTH_SECRET_KEY,
        {
            expiresIn: ACCESS_TOKEN_EXPIRES_IN,
            algorithm: "RS256",
        }
    );
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, AUTH_PUBLIC_KEY) as jwt.JwtPayload;
};
