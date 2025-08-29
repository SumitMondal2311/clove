export const getTtl = (exp?: number, fallback?: number): number => {
    if (!exp) {
        return fallback ?? 0;
    }
    return Math.ceil(Math.max(0, exp - Math.floor(Date.now() / 1000)));
};
