export const getExpiryDate = (durationMs: number): Date => {
    return new Date(Date.now() + durationMs);
};
