import { prisma } from "../index.js";

export const findLocalAccount = (email: string) => {
    return prisma.account.findUnique({
        where: {
            providerUserId_provider: {
                provider: "LOCAL",
                providerUserId: email,
            },
        },
    });
};
