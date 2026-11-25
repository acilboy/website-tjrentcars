import { Router } from "express";
import {
  getPublicServices,
  getPublicServiceBySlug,
  getAdminServices,
  createAdminService,
  updateAdminService,
  deleteAdminService,
} from "./services.controller.js";
import { authenticateAdmin } from "../../middlewares/auth.middleware.js";

const publicRouter = Router();
publicRouter.get("/", getPublicServices);
publicRouter.get("/:slug", getPublicServiceBySlug);

const adminRouter = Router();
adminRouter.use(authenticateAdmin);
adminRouter.get("/", getAdminServices);
adminRouter.post("/", createAdminService);
adminRouter.patch("/:id", updateAdminService);
adminRouter.delete("/:id", deleteAdminService);

export { publicRouter, adminRouter };
