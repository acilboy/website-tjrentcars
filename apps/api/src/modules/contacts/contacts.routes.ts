import { Router } from "express";
import {
  submitPublicContact,
  getAdminContactMessages,
  updateAdminContactStatus,
} from "./contacts.controller.js";
import { authenticateAdmin } from "../../middlewares/auth.middleware.js";
import { contactLimiter } from "../../middlewares/rate-limit.middleware.js";

const publicRouter = Router();
publicRouter.post("/", contactLimiter, submitPublicContact);

const adminRouter = Router();
adminRouter.use(authenticateAdmin);
adminRouter.get("/", getAdminContactMessages);
adminRouter.patch("/:id", updateAdminContactStatus);

export { publicRouter, adminRouter };
