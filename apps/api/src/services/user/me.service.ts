import { findSessionIncludeEmail } from "../../db/queries/session.query.js";
import { CloveError } from "../../utils/clove-error.js";

export const meService = async (
    sessionId: string
): Promise<{
    id: string;
    verified: boolean;
    sessionId: string;
    email: string;
    primary: boolean;
}> => {
    const sessionRecord = await findSessionIncludeEmail(sessionId);
    if (!sessionRecord) {
        throw new CloveError(404, {
            message: "Session not found",
            details: "No active session is associated with the user.",
        });
    }

    const {
        email: { verified, email, primary },
        userId,
    } = sessionRecord;

    return {
        sessionId,
        verified,
        id: userId,
        email,
        primary,
    };
};
