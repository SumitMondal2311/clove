import { prisma } from "@clove/database";
import { setTimeout } from "timers/promises";

export { prisma };

export const disconnectDB = async () => {
    try {
        await prisma.$disconnect();
        console.log("Database disconnected successfully");
    } catch (error) {
        console.error("Failed to disconnect DB");
    }
};

export const reconnectDB = async (attempt = 1) => {
    try {
        await prisma.$connect();
        console.log("Reconnected to database successfully");
    } catch (error) {
        if (attempt < 3) {
            console.warn("Reconnecting to DB...");
            await setTimeout(2000);
            await reconnectDB(attempt + 1);
        } else {
            console.error("Failed to reconnect DB");
            process.exit(1);
        }
    }
};

export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Failed init DB conenction");
        reconnectDB();
    }
};
