import { Router } from "express";
import {
  getPublicPageBySlug,
  getPublicFaqs,
  getPublicTestimonials,
  getAdminPages,
  createAdminPage,
  updateAdminPage,
  getAdminFaqs,
  createAdminFaq,
  updateAdminFaq,
  deleteAdminFaq,
} from "./content.controller.js";
import { authenticateAdmin } from "../../middlewares/auth.middleware.js";

const publicRouter = Router();
publicRouter.get("/pages/:slug", getPublicPageBySlug);
publicRouter.get("/faqs", getPublicFaqs);
publicRouter.get("/testimonials", getPublicTestimonials);

const adminRouter = Router();
adminRouter.use(authenticateAdmin);

// Pages
adminRouter.get("/pages", getAdminPages);
adminRouter.post("/pages", createAdminPage);
adminRouter.patch("/pages/:id", updateAdminPage);

// FAQs
adminRouter.get("/faqs", getAdminFaqs);
adminRouter.post("/faqs", createAdminFaq);
adminRouter.patch("/faqs/:id", updateAdminFaq);
adminRouter.delete("/faqs/:id", deleteAdminFaq);

export { publicRouter, adminRouter };
