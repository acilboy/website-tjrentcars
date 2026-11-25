import { Router } from "express";
import {
  getVehicleBlocks,
  createVehicleBlock,
  deleteVehicleBlock,
} from "./vehicle-blocks.controller.js";
import { authenticateAdmin } from "../../middlewares/auth.middleware.js";

const router = Router();
router.use(authenticateAdmin);

router.get("/", getVehicleBlocks);
router.post("/", createVehicleBlock);
router.delete("/:id", deleteVehicleBlock);

export default router;
