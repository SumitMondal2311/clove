import { app, startTime } from "./app.js";
import { env } from "./configs/env.js";
import { connectDB, disconnectDB } from "./lib/prisma.js";

const server = app.listen(env.PORT, async () => {
    console.log(`Ready in ${new Date().getTime() - startTime}ms`);
    console.log(`Server running on ${env.API_ORIGIN}`);
    connectDB();
});

let shuttingDown = false;

["SIGTERM", "SIGINT"].forEach((signal) => {
    process.on(signal, async () => {
        if (shuttingDown) return;
        shuttingDown = true;
        disconnectDB();
        server.close(() => {
            console.log("Server gracefully shut down");
            process.exit(0);
        });
    });
});

process.on("unhandledRejection", (error: Error) => {
    console.error(`Error unhandled rejection: ${error}`);
    process.exit();
});

process.on("uncaughtException", (error: Error) => {
    console.error(`Error uncaught exception: ${error}`);
    process.exit();
});
