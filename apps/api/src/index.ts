const initialTime = new Date().getTime();

import { env } from '@clove/env/api';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import http from 'http';
import morgan from 'morgan';
import { API_ORIGIN } from './configs/constants';

export const app: Express = express();

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
    console.error(err);

    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
    });
});

const server: http.Server = app.listen(env.PORT, () => {
    console.log(`   ✔️ Ready in ${new Date().getTime() - initialTime}ms`);
    console.log(`   ✔️ Server ready on ${API_ORIGIN}`);
    console.log('\n');
});

['SIGTERM', 'SIGINT'].forEach((signal) =>
    process.on(signal, () => {
        console.warn('\n   ❗️Shutting down server...');
        server.close(() => {
            console.warn('   ✔️ Server gracefully shut down\n');
            process.exit(0);
        });
    })
);

process.on('unhandledRejection', (error: Error) => {
    console.error(`Error unhandled rejection: ${error.message}`);
    process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
    console.error(`Error uncaught exception: ${error.message}`);
    process.exit(1);
});
