const { assertRequiredEnv, env } = require('./config/env');

assertRequiredEnv();

const app = require('./app');
const prisma = require('./config/db');
const logger = require('./utils/logger');

const server = app.listen(env.port, () => {
  logger.info(`ContentNova API listening on port ${env.port} [${env.nodeEnv}]`);
});

async function shutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
