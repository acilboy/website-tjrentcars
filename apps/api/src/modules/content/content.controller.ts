import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { pageSchema, faqSchema, testimonialSchema } from "../../schemas/index.js";
import { recordAuditLog } from "../../middlewares/audit.middleware.js";

// PUBLIC: Get published page
export async function getPublicPageBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;

    const page = await prisma.contentPage.findUnique({
      where: { slug },
    });

    if (!page || !page.isPublished) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Halaman tidak ditemukan atau belum dipublikasikan." },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: page.id,
        slug: page.slug,
        title: page.title,
        content: page.content,
        updatedAt: page.updatedAt,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        ogImageUrl: page.ogImageUrl,
        canonicalPath: page.canonicalPath || `/${page.slug}`,
      },
    });
  } catch (err) {
    next(err);
  }
}

// PUBLIC: Get active FAQs
export async function getPublicFaqs(_req: Request, res: Response, next: NextFunction) {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: faqs,
    });
  } catch (err) {
    next(err);
  }
}

// PUBLIC: Get published testimonials
export async function getPublicTestimonials(_req: Request, res: Response, next: NextFunction) {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: testimonials,
    });
  } catch (err) {
    next(err);
  }
}

// ADMIN: Pages CRUD
export async function getAdminPages(_req: Request, res: Response, next: NextFunction) {
  try {
    const pages = await prisma.contentPage.findMany({
      orderBy: { slug: "asc" },
    });
    return res.status(200).json({ success: true, data: pages });
  } catch (err) {
    next(err);
  }
}

export async function createAdminPage(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = pageSchema.parse(req.body);
    const existing = await prisma.contentPage.findUnique({ where: { slug: payload.slug } });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: { code: "SLUG_EXISTS", message: `Slug '${payload.slug}' sudah ada.` },
      });
    }

    const page = await prisma.contentPage.create({ data: payload });
    await recordAuditLog({
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      action: "CREATE_PAGE",
      entity: "ContentPage",
      entityId: page.id,
    });
    return res.status(201).json({ success: true, data: page });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminPage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const payload = pageSchema.partial().parse(req.body);

    const updated = await prisma.contentPage.update({
      where: { id },
      data: payload,
    });

    await recordAuditLog({
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      action: "UPDATE_PAGE",
      entity: "ContentPage",
      entityId: id,
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

// ADMIN: FAQs CRUD
export async function getAdminFaqs(_req: Request, res: Response, next: NextFunction) {
  try {
    const faqs = await prisma.fAQ.findMany({ orderBy: { sortOrder: "asc" } });
    return res.status(200).json({ success: true, data: faqs });
  } catch (err) {
    next(err);
  }
}

export async function createAdminFaq(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = faqSchema.parse(req.body);
    const faq = await prisma.fAQ.create({ data: payload });
    return res.status(201).json({ success: true, data: faq });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminFaq(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const payload = faqSchema.partial().parse(req.body);
    const updated = await prisma.fAQ.update({ where: { id }, data: payload });
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdminFaq(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.fAQ.delete({ where: { id } });
    return res.status(200).json({ success: true, data: { message: "FAQ berhasil dihapus." } });
  } catch (err) {
    next(err);
  }
}
