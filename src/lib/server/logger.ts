import pino from 'pino';
import { serverEnv } from './config/env.server';

export const logger = pino({
  level: serverEnv.app.logLevel || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
  base: {
    env: serverEnv.app.nodeEnv,
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
});

export type Logger = typeof logger;
