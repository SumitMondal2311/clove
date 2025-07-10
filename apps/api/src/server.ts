const initialTime = new Date().getTime();

import { prisma } from '@clove/database';
import { logger } from '@clove/logger';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { ApiError } from './configs/api-error.js';
import { env } from './configs/env.js';
import { authRouter } from './routes/auth.route.js';

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
app.use(morgan('dev'));

app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        message: 'OK',
    });
});

app.use('/api/auth', authRouter);

app.use((err: ApiError, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(err);
    res.status(err.statusCode || 500).json({
        message: err.message || 'Internal server error',
    });
});

const server = app.listen(env.PORT, async () => {
    logger.info(`Ready in ${new Date().getTime() - initialTime}ms`);
    logger.info(`Server running on ${env.API_ORIGIN}`);
    await prisma.$connect().then(() => {
        logger.info('Database connected successfully');
    });
});

['SIGTERM', 'SIGINT'].forEach((signal) => {
    process.on(signal, () => {
        server.close(async () => {
            await prisma.$disconnect().then(() => {
                logger.info('Database disconnected successfully');
            });
            logger.info('Server gracefully shut down');
            process.exit(0);
        });
    });
});

process.on('unhandledRejection', (error: Error) => {
    logger.error(`Error unhandled rejection: ${error.message}`);
    process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
    logger.error(`Error uncaught exception: ${error.message}`);
    process.exit(1);
});
