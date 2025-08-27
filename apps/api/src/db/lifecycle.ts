import { env } from "../configs/env.js";
import { delay } from "../utils/delay.js";
import { prisma } from "./client.js";

export const reconnectDB = async (attempt = 1) => {
    try {
        await prisma.$connect();
        console.log("Reconnected to database successfully");
    } catch (error) {
        if (attempt <= env.DATABASE_MAX_RETRIES) {
            const wait = 2 ** attempt * 1000;
            console.warn("Failed reconnecting to database");
            console.warn(`Retrying in ${wait / 1000}s...`);
            await delay(wait);
            await reconnectDB(attempt + 1);
        } else {
            console.error("Database reconnection failed: ", error);
            process.exit(1);
        }
    }
};

export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Failed init database conenction");
        reconnectDB();
    }
};

export const disconnectDB = async () => {
    try {
        await prisma.$disconnect();
        console.log("Databse disconnected successfully");
    } catch (error) {
        console.error("Failed to disconnect database");
    }
};
