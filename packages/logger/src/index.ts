import pino from 'pino';

const baseConfig = {
    timestamp: pino.stdTimeFunctions.isoTime,
};

export const logger = pino(
    process.env.NODE_ENV === 'production'
        ? {
              level: 'info',
              ...baseConfig,
          }
        : {
              level: 'debug',
              ...baseConfig,
              transport: {
                  target: 'pino-pretty',
                  options: {
                      colorize: true,
                      translateTime: 'dd-mm-yyyy HH:MM',
                      ignore: 'pid,hostname',
                  },
              },
          }
);
