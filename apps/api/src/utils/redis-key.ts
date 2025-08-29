export const redisKey = {
    verificationResends: (email: string) => `verification:resends:${email}`,
    verificationRateLimit: (email: string) => `verification:rate-limit:${email}`,
    blacklistJti: (jti: string) => `blacklist:jti:${jti}`,
};
