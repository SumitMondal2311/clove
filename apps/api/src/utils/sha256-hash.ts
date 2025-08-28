import { createHash } from "crypto";

export const sha256Hash = (data: Buffer | string): string => {
    return createHash("sha256").update(data).digest("hex");
};
