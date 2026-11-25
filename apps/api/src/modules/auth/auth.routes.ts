import { Router } from "express";
import { login, logout, getMe } from "./auth.controller.js";
import { authenticateAdmin } from "../../middlewares/auth.middleware.js";
import { loginLimiter } from "../../middlewares/rate-limit.middleware.js";

const router = Router();

router.post("/login", loginLimiter, login);
router.post("/logout", authenticateAdmin, logout);
router.get("/me", authenticateAdmin, getMe);

export default router;
