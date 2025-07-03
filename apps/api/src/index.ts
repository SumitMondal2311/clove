const initialTime = new Date().getTime();

import { prisma } from '@clove/database';
import { env } from '@clove/env/api';
import { logger } from '@clove/logger';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { API_ORIGIN } from './configs/constants.js';

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
    cors({
        origin: env.WEB_ORIGIN,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    })
);

app.use(helmet());
app.use(morgan(' api: :method :url :status'));

app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        message: 'OK',
    });
});

interface AppError extends Error {
    status?: number;
}

app.use((err: AppError, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(err);

    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
    });
});
const server = app.listen(env.PORT, async () => {
    logger.info(`Server ready in ${new Date().getTime() - initialTime}ms`);
    logger.info(`Server running on ${API_ORIGIN}`);
    await prisma.$connect().then(() => {
        logger.info('Database connected successfully');
    });
});

let shutdown = false;

['SIGTERM', 'SIGINT'].forEach((signal) =>
    process.on(signal, async () => {
        if (shutdown) return;
        shutdown = true;
        await prisma.$disconnect().then(() => {
            logger.warn('Database successfully disconnected');
        });
        logger.warn('Shutting down server...');
        server.close(() => {
            logger.info('Server gracefully shut down');
            process.exit(0);
        });
    })
);

process.on('unhandledRejection', (error: Error) => {
    logger.error(`\nError unhandled rejection: ${error.message}\n`);
    process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
    logger.error(`\nError uncaught exception: ${error.message}\n`);
    process.exit(1);
});
