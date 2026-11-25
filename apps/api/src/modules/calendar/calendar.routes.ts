import { Router } from "express";
import { getCalendarData } from "./calendar.controller.js";
import { authenticateAdmin } from "../../middlewares/auth.middleware.js";

const router = Router();
router.use(authenticateAdmin);

router.get("/", getCalendarData);

export default router;
