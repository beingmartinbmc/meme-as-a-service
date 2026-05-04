import type { Server } from 'http';
import closeWithGrace from 'close-with-grace';
import app from './server';
import { logger } from '../observability/logger';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const SHUTDOWN_DELAY_MS = parseInt(process.env.SHUTDOWN_DELAY_MS || '10000', 10);

export function startServer(port: number = PORT, host: string = HOST): Server {
  const server = app.listen(port, host, () => {
    logger.info(`Meme-as-a-Service API listening on http://${host}:${port}`);
    logger.info(`Docs:    http://${host}:${port}/docs`);
    logger.info(`OpenAPI: http://${host}:${port}/openapi.json`);
  });

  closeWithGrace({ delay: SHUTDOWN_DELAY_MS }, async ({ signal, err }) => {
    if (err) {
      logger.error({ err }, 'Shutting down due to error');
    } else if (signal) {
      logger.info(`Received ${signal}, draining in-flight requests...`);
    }
    await new Promise<void>((resolve, reject) =>
      server.close((closeErr) => (closeErr ? reject(closeErr) : resolve()))
    );
  });

  return server;
}

if (require.main === module) {
  startServer();
}

export default app;
