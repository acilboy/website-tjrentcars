import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { config } from "./config/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";

// Import routers
import authRouter from "./modules/auth/auth.routes.js";
import dashboardRouter from "./modules/dashboard/dashboard.routes.js";
import {
  publicRouter as vehiclesPublic,
  adminRouter as vehiclesAdmin,
} from "./modules/vehicles/vehicles.routes.js";
import ratesRouter from "./modules/rates/rates.routes.js";
import {
  publicRouter as servicesPublic,
  adminRouter as servicesAdmin,
} from "./modules/services/services.routes.js";
import availabilityRouter from "./modules/availability/availability.routes.js";
import {
  publicRouter as bookingsPublic,
  adminRouter as bookingsAdmin,
} from "./modules/bookings/bookings.routes.js";
import calendarRouter from "./modules/calendar/calendar.routes.js";
import vehicleBlocksRouter from "./modules/vehicle-blocks/vehicle-blocks.routes.js";
import {
  publicRouter as contentPublic,
  adminRouter as contentAdmin,
} from "./modules/content/content.routes.js";
import {
  publicRouter as articlesPublic,
  adminRouter as articlesAdmin,
} from "./modules/articles/articles.routes.js";
import {
  publicRouter as settingsPublic,
  adminRouter as settingsAdmin,
} from "./modules/settings/settings.routes.js";
import {
  publicRouter as contactsPublic,
  adminRouter as contactsAdmin,
} from "./modules/contacts/contacts.routes.js";

export const app = express();

// Security & Parsing Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: [config.FRONTEND_URL, config.PUBLIC_SITE_URL, "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Static file uploads serving
if (!fs.existsSync(config.storagePath)) {
  fs.mkdirSync(config.storagePath, { recursive: true });
}
app.use("/uploads", express.static(config.storagePath));

// Healthcheck
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// OpenAPI Spec endpoint
app.get(`${config.API_BASE_PATH}/docs`, (_req: Request, res: Response) => {
  const docsPath = path.resolve(process.cwd(), "src/docs/openapi.json");
  if (fs.existsSync(docsPath)) {
    const spec = JSON.parse(fs.readFileSync(docsPath, "utf-8"));
    return res.status(200).json(spec);
  }
  return res.status(404).json({ error: "Documentation not found" });
});

// Mount Public Routes
const publicApi = express.Router();
publicApi.use("/settings", settingsPublic);
publicApi.use("/vehicles", availabilityRouter);
publicApi.use("/vehicles", vehiclesPublic);
publicApi.use("/services", servicesPublic);
publicApi.use("/articles", articlesPublic);
publicApi.use("/bookings", bookingsPublic);
publicApi.use("/contact", contactsPublic);
publicApi.use("/", contentPublic); // /pages/:slug, /faqs, /testimonials

app.use(`${config.API_BASE_PATH}/public`, publicApi);

// Mount Admin Routes
const adminApi = express.Router();
adminApi.use("/auth", authRouter);
adminApi.use("/dashboard", dashboardRouter);
adminApi.use("/vehicles", vehiclesAdmin);
adminApi.use("/vehicles/:vehicleId/rates", ratesRouter);
adminApi.use("/services", servicesAdmin);
adminApi.use("/bookings", bookingsAdmin);
adminApi.use("/calendar", calendarRouter);
adminApi.use("/vehicle-blocks", vehicleBlocksRouter);
adminApi.use("/articles", articlesAdmin);
adminApi.use("/settings", settingsAdmin);
adminApi.use("/contacts", contactsAdmin);
adminApi.use("/", contentAdmin); // /pages, /faqs

app.use(`${config.API_BASE_PATH}/admin`, adminApi);

// 404 Handler for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`,
    },
  });
});

// Global Error Handler
app.use(errorHandler);
