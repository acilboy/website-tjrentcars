import { Router } from "express";
import {
  getPublicSettings,
  getAdminSettings,
  updateAdminSettings,
} from "./settings.controller.js";
import { authenticateAdmin } from "../../middlewares/auth.middleware.js";

const publicRouter = Router();
publicRouter.get("/", getPublicSettings);

const adminRouter = Router();
adminRouter.use(authenticateAdmin);
adminRouter.get("/", getAdminSettings);
adminRouter.patch("/", updateAdminSettings);

export { publicRouter, adminRouter };
