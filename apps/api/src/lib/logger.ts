import pino from "pino";
import { config } from "../config/index.js";

export const logger = pino({
  level: config.isDev ? "debug" : "info",
  redact: {
    paths: [
      "req.headers.cookie",
      "req.headers.authorization",
      "req.body.password",
      "password",
      "passwordHash",
      "customerPhone",
      "customerEmail",
    ],
    remove: true,
  },
  transport: config.isDev
    ? {
        target: "pino/file",
        options: { destination: 1 }, // stdout
      }
    : undefined,
});
