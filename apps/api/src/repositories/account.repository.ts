import { prisma } from "@clove/database";

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
