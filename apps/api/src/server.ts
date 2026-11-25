import { app } from "./app.js";
import { config } from "./config/index.js";
import { logger } from "./lib/logger.js";

const server = app.listen(config.PORT, () => {
  logger.info(`🚀 TJ Rentcar API Server running on http://localhost:${config.PORT}`);
  logger.info(`📚 API Documentation available at http://localhost:${config.PORT}${config.API_BASE_PATH}/docs`);
  logger.info(`🌐 Environment: ${config.NODE_ENV}`);
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    logger.info("Server closed.");
    process.exit(0);
  });
});
