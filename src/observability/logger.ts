import pino from 'pino';

const level =
  process.env.LOG_LEVEL ||
  (process.env.NODE_ENV === 'test'
    ? 'silent'
    : process.env.NODE_ENV === 'production'
      ? 'info'
      : 'debug');

export const logger = pino({
  level,
  base: { service: 'meme-as-a-service' },
  redact: ['req.headers.authorization', 'req.headers["x-api-key"]'],
  timestamp: pino.stdTimeFunctions.isoTime
});
