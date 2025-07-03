import { sharedEnv } from '@clove/env/shared';
import { config, createLogger, format, transports } from 'winston';

const customTimestamp = format.timestamp({
    format: 'DD-MM-YYYY HH:mm:ss',
});

const customPrintf = format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

export const logger = createLogger({
    format:
        sharedEnv.NODE_ENV === 'production'
            ? format.combine(
                  customTimestamp,
                  customPrintf,
                  format.errors({ stack: true })
              )
            : format.combine(
                  format.colorize({ colors: config.npm.colors }),
                  customTimestamp,
                  customPrintf,
                  format.errors({ stack: true })
              ),
    transports: [new transports.Console()],
});
