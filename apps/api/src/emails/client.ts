import { CreateEmailResponseSuccess, Resend } from "resend";
import { env } from "../configs/env.js";
import { CloveError } from "../utils/clove-error.js";

const resend = new Resend(env.RESEND_API_KEY);

export const resendClient = async ({
    subject,
    email,
    template,
}: {
    subject: string;
    email: string;
    template: string;
}): Promise<CreateEmailResponseSuccess> => {
    const { data, error } = await resend.emails.send({
        from: "Acme <onboarding@resend.dev>",
        to: email,
        subject,
        html: template,
    });

    if (error) {
        throw new CloveError(500, {
            message: "Resend email service error",
            details: error.message,
        });
    }

    return data;
};
