import { Router } from "express";
import {
  createPublicBooking,
  getAdminBookings,
  getAdminBookingById,
  updateAdminBookingStatus,
  updateAdminBookingNotes,
} from "./bookings.controller.js";
import { authenticateAdmin } from "../../middlewares/auth.middleware.js";
import { bookingLimiter } from "../../middlewares/rate-limit.middleware.js";

const publicRouter = Router();
publicRouter.post("/", bookingLimiter, createPublicBooking);

const adminRouter = Router();
adminRouter.use(authenticateAdmin);
adminRouter.get("/", getAdminBookings);
adminRouter.get("/:id", getAdminBookingById);
adminRouter.patch("/:id/status", updateAdminBookingStatus);
adminRouter.patch("/:id/notes", updateAdminBookingNotes);

export { publicRouter, adminRouter };
