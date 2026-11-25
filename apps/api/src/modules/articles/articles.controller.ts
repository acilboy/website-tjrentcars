import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { articleSchema } from "../../schemas/index.js";
import { recordAuditLog } from "../../middlewares/audit.middleware.js";
import { ArticleStatus, Prisma } from "@prisma/client";

// PUBLIC: Get published articles
export async function getPublicArticles(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit as string, 10) || 10));

    const where: Prisma.ArticleWhereInput = {
      status: ArticleStatus.PUBLISHED,
    };

    const [total, articles] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const formatted = articles.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      featuredImageUrl: a.featuredImageUrl,
      featuredImageAlt: a.featuredImageAlt,
      category: a.category,
      authorName: a.authorName,
      publishedAt: a.publishedAt,
      metaTitle: a.metaTitle,
      metaDescription: a.metaDescription,
      canonicalPath: a.canonicalPath || `/artikel/${a.slug}`,
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

// PUBLIC: Get single published article by slug
export async function getPublicArticleBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;

    const article = await prisma.article.findUnique({
      where: { slug },
    });

    if (!article || article.status !== ArticleStatus.PUBLISHED) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Artikel tidak ditemukan atau belum dipublikasikan." },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        featuredImageUrl: article.featuredImageUrl,
        featuredImageAlt: article.featuredImageAlt,
        category: article.category,
        authorName: article.authorName,
        publishedAt: article.publishedAt,
        updatedAt: article.updatedAt,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        ogImageUrl: article.ogImageUrl || article.featuredImageUrl,
        canonicalPath: article.canonicalPath || `/artikel/${article.slug}`,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ADMIN: List articles
export async function getAdminArticles(req: Request, res: Response, next: NextFunction) {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ success: true, data: articles });
  } catch (err) {
    next(err);
  }
}

// ADMIN: Get article by ID
export async function getAdminArticleById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Artikel tidak ditemukan." },
      });
    }
    return res.status(200).json({ success: true, data: article });
  } catch (err) {
    next(err);
  }
}

// ADMIN: Create article
export async function createAdminArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = articleSchema.parse(req.body);

    const existingSlug = await prisma.article.findUnique({ where: { slug: payload.slug } });
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        error: { code: "SLUG_EXISTS", message: `Slug '${payload.slug}' sudah digunakan.` },
      });
    }

    const article = await prisma.article.create({
      data: {
        ...payload,
        publishedAt: payload.status === ArticleStatus.PUBLISHED ? new Date() : null,
      },
    });

    await recordAuditLog({
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      action: "CREATE_ARTICLE",
      entity: "Article",
      entityId: article.id,
      metadata: { title: article.title, status: article.status },
    });

    return res.status(201).json({ success: true, data: article });
  } catch (err) {
    next(err);
  }
}

// ADMIN: Update article
export async function updateAdminArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const payload = articleSchema.partial().parse(req.body);

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Artikel tidak ditemukan." },
      });
    }

    if (payload.slug && payload.slug !== existing.slug) {
      const slugTaken = await prisma.article.findUnique({ where: { slug: payload.slug } });
      if (slugTaken) {
        return res.status(400).json({
          success: false,
          error: { code: "SLUG_EXISTS", message: `Slug '${payload.slug}' sudah digunakan.` },
        });
      }
    }

    let publishedAt = existing.publishedAt;
    if (payload.status === ArticleStatus.PUBLISHED && !existing.publishedAt) {
      publishedAt = new Date();
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        ...payload,
        publishedAt,
      },
    });

    await recordAuditLog({
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      action: "UPDATE_ARTICLE",
      entity: "Article",
      entityId: id,
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

// ADMIN: Delete article
export async function deleteAdminArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.article.delete({ where: { id } });
    return res.status(200).json({ success: true, data: { message: "Artikel berhasil dihapus." } });
  } catch (err) {
    next(err);
  }
}
