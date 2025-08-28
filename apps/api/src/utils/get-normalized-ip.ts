export const getNormalizedIP = (ip: string): string => {
    if (ip === "::1") {
        return "127.0.0.1";
    } else if (ip.startsWith("::ffff:")) {
        ip.replace("::ffff:", "");
    }

    return ip;
};
