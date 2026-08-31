import { createApp } from './app.js';
import { apiConfig } from '@sih26019/config';

const app = createApp();

const server = app.listen(apiConfig.port, () => {
  console.log(`[API] Server started in ${apiConfig.nodeEnv} mode`);
  console.log(`[API] Health endpoint available at http://localhost:${apiConfig.port}/health`);
});

// Handle graceful shutdown
const shutdown = (): void => {
  console.log('[API] Shutting down gracefully...');
  server.close(() => {
    console.log('[API] Server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
