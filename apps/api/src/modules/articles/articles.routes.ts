import { Router } from "express";
import {
  getPublicArticles,
  getPublicArticleBySlug,
  getAdminArticles,
  getAdminArticleById,
  createAdminArticle,
  updateAdminArticle,
  deleteAdminArticle,
} from "./articles.controller.js";
import { authenticateAdmin } from "../../middlewares/auth.middleware.js";

const publicRouter = Router();
publicRouter.get("/", getPublicArticles);
publicRouter.get("/:slug", getPublicArticleBySlug);

const adminRouter = Router();
adminRouter.use(authenticateAdmin);
adminRouter.get("/", getAdminArticles);
adminRouter.post("/", createAdminArticle);
adminRouter.get("/:id", getAdminArticleById);
adminRouter.patch("/:id", updateAdminArticle);
adminRouter.delete("/:id", deleteAdminArticle);

export { publicRouter, adminRouter };
