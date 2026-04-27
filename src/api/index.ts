import type { Server } from 'http';
import app from './server';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

export function startServer(port: number = PORT, host: string = HOST): Server {
  const server = app.listen(port, host, () => {
    // eslint-disable-next-line no-console
    console.log(`Meme-as-a-Service API listening on http://${host}:${port}`);
    // eslint-disable-next-line no-console
    console.log(`Docs:    http://${host}:${port}/docs`);
    // eslint-disable-next-line no-console
    console.log(`OpenAPI: http://${host}:${port}/openapi.json`);
  });

  const shutdown = (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`\nReceived ${signal}, shutting down gracefully...`);
    const force = setTimeout(() => {
      // eslint-disable-next-line no-console
      console.error('Forcing shutdown after 10s');
      process.exit(1);
    }, 10_000);
    force.unref();

    server.close((err) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error('Error during shutdown:', err);
        process.exit(1);
      }
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return server;
}

if (require.main === module) {
  startServer();
}

export default app;
