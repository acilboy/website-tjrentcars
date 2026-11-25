import { Router } from "express";
import { checkVehicleAvailability } from "./availability.controller.js";

const router = Router();
router.get("/:id/availability", checkVehicleAvailability);

export default router;
