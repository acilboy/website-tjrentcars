import { Router } from "express";
import {
  getRatesByVehicleId,
  createRate,
  updateRate,
  deleteRate,
} from "./rates.controller.js";
import { authenticateAdmin } from "../../middlewares/auth.middleware.js";

const router = Router({ mergeParams: true });
router.use(authenticateAdmin);

router.get("/", getRatesByVehicleId);
router.post("/", createRate);
router.patch("/:rateId", updateRate);
router.delete("/:rateId", deleteRate);

export default router;
