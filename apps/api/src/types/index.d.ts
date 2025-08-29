import "express";

declare global {
    namespace Express {
        interface Request {
            authData?: {
                sessionId: string;
                user: {
                    primary: boolean;
                    id: string;
                    email: string;
                };
            };
        }
    }
}
