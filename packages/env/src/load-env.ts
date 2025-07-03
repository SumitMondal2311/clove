import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

export const loadEnv = (loadFrom: 'currDir' | 'rootDir') => {
    const envFile = `.env.${process.env.NODE_ENV === 'production' ? 'prod' : 'dev'}`;
    if (loadFrom === 'rootDir') {
        for (const possiblePath of ['../../', '../../../']) {
            const filePath = path.resolve(process.cwd(), possiblePath, envFile);
            if (fs.existsSync(filePath)) {
                return config({
                    path: filePath,
                });
            }

            throw new Error(`Missing .env.prod or .env.dev file in root dir`);
        }
    } else if (loadFrom === 'currDir') {
        const filePath = path.resolve(process.cwd(), envFile);
        if (fs.existsSync(filePath)) {
            return config({
                path: filePath,
            });
        }

        throw new Error(
            `Missing .env.prod or .env.dev file in ${process.cwd().split('/').at(-1)} dir`
        );
    }
};
