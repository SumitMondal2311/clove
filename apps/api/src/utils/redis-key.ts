export const redisKey = {
    verificationRateLimit: (email: string) => `verification:rate-limit:${email}`,
    verificationResends: (email: string) => `verification:resends:${email}`,
};
