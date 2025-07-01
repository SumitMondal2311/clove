import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

export const loadEnv = () => {
    const envFile = `.env.${process.env.NODE_ENV === 'production' ? 'prod' : 'dev'}`;
    if (fs.existsSync(path.resolve(process.cwd(), envFile))) {
        return config({
            path: path.resolve(process.cwd(), envFile),
        });
    }

    throw new Error(
        `Missing .env.prod or .env.dev file in ${process.cwd().split('/').at(-1)} dir`
    );
};
