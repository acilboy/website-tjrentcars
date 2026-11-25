import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { createServiceSchema, updateServiceSchema } from "../../schemas/index.js";
import { recordAuditLog } from "../../middlewares/audit.middleware.js";

// PUBLIC: Get active services
export async function getPublicServices(_req: Request, res: Response, next: NextFunction) {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { vehicles: true } },
      },
    });

    const data = services.map((s) => ({
      id: s.id,
      title: s.title,
      slug: s.slug,
      shortDescription: s.shortDescription,
      description: s.description,
      imageUrl: s.imageUrl,
      sortOrder: s.sortOrder,
      metaTitle: s.metaTitle,
      metaDescription: s.metaDescription,
      ogImageUrl: s.ogImageUrl,
      canonicalPath: s.canonicalPath || `/layanan/${s.slug}`,
      totalVehicles: s._count.vehicles,
    }));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

// PUBLIC: Get service detail by slug
export async function getPublicServiceBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;

    const service = await prisma.service.findUnique({
      where: { slug },
      include: {
        vehicles: {
          where: { vehicle: { isActive: true } },
          include: {
            vehicle: {
              include: {
                images: { where: { isPrimary: true } },
                rates: { where: { isActive: true } },
              },
            },
          },
        },
      },
    });

    if (!service || !service.isActive) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Layanan tidak ditemukan atau sedang tidak aktif." },
      });
    }

    const availableVehicles = service.vehicles.map((v) => {
      const veh = v.vehicle;
      const primaryImage = veh.images[0] || null;
      const activeRates = veh.rates;
      const minRate = activeRates.length > 0 ? Math.min(...activeRates.map((r) => r.amount)) : null;

      return {
        id: veh.id,
        name: veh.name,
        slug: veh.slug,
        brand: veh.brand,
        model: veh.model,
        category: veh.category,
        transmission: veh.transmission,
        seats: veh.seats,
        primaryImage: primaryImage ? { url: primaryImage.url, altText: primaryImage.altText } : null,
        minRate,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        id: service.id,
        title: service.title,
        slug: service.slug,
        shortDescription: service.shortDescription,
        description: service.description,
        imageUrl: service.imageUrl,
        metaTitle: service.metaTitle,
        metaDescription: service.metaDescription,
        ogImageUrl: service.ogImageUrl,
        canonicalPath: service.canonicalPath || `/layanan/${service.slug}`,
        vehicles: availableVehicles,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ADMIN: Get all services
export async function getAdminServices(_req: Request, res: Response, next: NextFunction) {
  try {
    const services = await prisma.service.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { vehicles: true } },
      },
    });

    return res.status(200).json({
      success: true,
      data: services,
    });
  } catch (err) {
    next(err);
  }
}

// ADMIN: Create service
export async function createAdminService(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = createServiceSchema.parse(req.body);

    const existingSlug = await prisma.service.findUnique({
      where: { slug: payload.slug },
    });
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        error: { code: "SLUG_EXISTS", message: `Slug '${payload.slug}' sudah digunakan.` },
      });
    }

    const service = await prisma.service.create({
      data: payload,
    });

    await recordAuditLog({
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      action: "CREATE_SERVICE",
      entity: "Service",
      entityId: service.id,
      metadata: payload,
    });

    return res.status(201).json({
      success: true,
      data: service,
    });
  } catch (err) {
    next(err);
  }
}

// ADMIN: Update service
export async function updateAdminService(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const payload = updateServiceSchema.parse(req.body);

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Layanan tidak ditemukan." },
      });
    }

    if (payload.slug && payload.slug !== existing.slug) {
      const slugTaken = await prisma.service.findUnique({ where: { slug: payload.slug } });
      if (slugTaken) {
        return res.status(400).json({
          success: false,
          error: { code: "SLUG_EXISTS", message: `Slug '${payload.slug}' sudah digunakan.` },
        });
      }
    }

    const updated = await prisma.service.update({
      where: { id },
      data: payload,
    });

    await recordAuditLog({
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      action: "UPDATE_SERVICE",
      entity: "Service",
      entityId: id,
      metadata: payload,
    });

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

// ADMIN: Delete service
export async function deleteAdminService(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Layanan tidak ditemukan." },
      });
    }

    await prisma.service.delete({ where: { id } });

    await recordAuditLog({
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      action: "DELETE_SERVICE",
      entity: "Service",
      entityId: id,
    });

    return res.status(200).json({
      success: true,
      data: { message: "Layanan berhasil dihapus." },
    });
  } catch (err) {
    next(err);
  }
}
