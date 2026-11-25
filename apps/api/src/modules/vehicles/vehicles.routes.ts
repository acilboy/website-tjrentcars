import { Router } from "express";
import {
  getPublicVehicles,
  getPublicVehicleBySlug,
  getAdminVehicles,
  getAdminVehicleById,
  createAdminVehicle,
  updateAdminVehicle,
  deleteAdminVehicle,
  uploadVehicleImage,
  deleteVehicleImage,
  setPrimaryVehicleImage,
} from "./vehicles.controller.js";
import { authenticateAdmin } from "../../middlewares/auth.middleware.js";
import { upload } from "../../lib/storage.js";

const publicRouter = Router();
publicRouter.get("/", getPublicVehicles);
publicRouter.get("/:slug", getPublicVehicleBySlug);

const adminRouter = Router();
adminRouter.use(authenticateAdmin);
adminRouter.get("/", getAdminVehicles);
adminRouter.post("/", createAdminVehicle);
adminRouter.get("/:id", getAdminVehicleById);
adminRouter.patch("/:id", updateAdminVehicle);
adminRouter.delete("/:id", deleteAdminVehicle);

// Image management
adminRouter.post("/:id/images", upload.single("image"), uploadVehicleImage);
adminRouter.delete("/:id/images/:imageId", deleteVehicleImage);
adminRouter.patch("/:id/images/:imageId/primary", setPrimaryVehicleImage);

export { publicRouter, adminRouter };
