import { Router } from "express";
import { getDashboardStats } from "./dashboard.controller.js";
import { authenticateAdmin } from "../../middlewares/auth.middleware.js";

const router = Router();
router.use(authenticateAdmin);

router.get("/", getDashboardStats);

export default router;
