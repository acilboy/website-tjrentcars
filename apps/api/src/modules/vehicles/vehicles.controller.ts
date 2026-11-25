import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleQuerySchema,
} from "../../schemas/index.js";
import { recordAuditLog } from "../../middlewares/audit.middleware.js";
import { deleteFile } from "../../lib/storage.js";
import { Prisma } from "@prisma/client";

// Format vehicle response for public display
function formatVehiclePublic(v: any) {
  let parsedFeatures: string[] = [];
  try {
    parsedFeatures = v.features ? JSON.parse(v.features) : [];
  } catch {
    parsedFeatures = v.features ? [v.features] : [];
  }

  const primaryImage = v.images?.find((img: any) => img.isPrimary) || v.images?.[0] || null;

  // Find lowest active rate
  const activeRates = v.rates?.filter((r: any) => r.isActive) || [];
  const minRate = activeRates.length > 0
    ? Math.min(...activeRates.map((r: any) => r.amount))
    : null;

  return {
    id: v.id,
    name: v.name,
    slug: v.slug,
    brand: v.brand,
    model: v.model,
    year: v.year,
    category: v.category,
    transmission: v.transmission,
    seats: v.seats,
    doors: v.doors,
    fuelType: v.fuelType,
    luggageCapacity: v.luggageCapacity,
    description: v.description,
    features: parsedFeatures,
    primaryImage: primaryImage ? { id: primaryImage.id, url: primaryImage.url, altText: primaryImage.altText } : null,
    images: v.images?.map((img: any) => ({
      id: img.id,
      url: img.url,
      altText: img.altText,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder,
    })) || [],
    rates: activeRates.map((r: any) => ({
      id: r.id,
      serviceType: r.serviceType,
      billingUnit: r.billingUnit,
      amount: r.amount,
      notes: r.notes,
    })),
    minRate,
    services: v.services?.map((vs: any) => ({
      id: vs.service.id,
      title: vs.service.title,
      slug: vs.service.slug,
    })) || [],
    metaTitle: v.metaTitle,
    metaDescription: v.metaDescription,
    ogImageUrl: v.ogImageUrl || primaryImage?.url || null,
    canonicalPath: v.canonicalPath || `/mobil/${v.slug}`,
    robotsIndex: v.robotsIndex,
    robotsFollow: v.robotsFollow,
  };
}

// PUBLIC: List vehicles
export async function getPublicVehicles(req: Request, res: Response, next: NextFunction) {
  try {
    const query = vehicleQuerySchema.parse(req.query);
    const { search, brand, category, transmission, seats, serviceType, minPrice, maxPrice, sort, page, limit } = query;

    const where: Prisma.VehicleWhereInput = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
      ];
    }

    if (brand) {
      where.brand = { equals: brand, mode: "insensitive" };
    }

    if (category) {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (transmission) {
      where.transmission = transmission;
    }

    if (seats) {
      where.seats = { gte: seats };
    }

    if (serviceType) {
      where.rates = {
        some: {
          serviceType,
          isActive: true,
        },
      };
    }

    let orderBy: Prisma.VehicleOrderByWithRelationInput = { sortOrder: "asc" };
    if (sort === "name_asc") {
      orderBy = { name: "asc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    }

    const total = await prisma.vehicle.count({ where });

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        rates: { where: { isActive: true } },
        services: { include: { service: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    let formatted = vehicles.map(formatVehiclePublic);

    // Apply price filter and price sorting if requested
    if (minPrice !== undefined) {
      formatted = formatted.filter((v) => v.minRate !== null && v.minRate >= minPrice);
    }
    if (maxPrice !== undefined) {
      formatted = formatted.filter((v) => v.minRate !== null && v.minRate <= maxPrice);
    }
    if (sort === "price_asc") {
      formatted.sort((a, b) => (a.minRate || Infinity) - (b.minRate || Infinity));
    } else if (sort === "price_desc") {
      formatted.sort((a, b) => (b.minRate || 0) - (a.minRate || 0));
    }

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

// PUBLIC: Detail vehicle by slug
export async function getPublicVehicleBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        rates: { where: { isActive: true } },
        services: { include: { service: true } },
      },
    });

    if (!vehicle || !vehicle.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Kendaraan tidak ditemukan atau sedang tidak tersedia.",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: formatVehiclePublic(vehicle),
    });
  } catch (err) {
    next(err);
  }
}

// ADMIN: List all vehicles
export async function getAdminVehicles(req: Request, res: Response, next: NextFunction) {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        rates: true,
        services: { include: { service: true } },
        _count: { select: { bookings: true, blocks: true } },
      },
      orderBy: { sortOrder: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: vehicles,
    });
  } catch (err) {
    next(err);
  }
}

// ADMIN: Get vehicle by ID
export async function getAdminVehicleById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        rates: true,
        services: { include: { service: true } },
      },
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Kendaraan tidak ditemukan." },
      });
    }

    return res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (err) {
    next(err);
  }
}

// ADMIN: Create vehicle
export async function createAdminVehicle(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = createVehicleSchema.parse(req.body);

    const existingSlug = await prisma.vehicle.findUnique({
      where: { slug: payload.slug },
    });
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        error: {
          code: "SLUG_EXISTS",
          message: `Slug '${payload.slug}' sudah digunakan oleh kendaraan lain.`,
        },
      });
    }

    const { serviceIds, features, ...rest } = payload;
    const featuresString = Array.isArray(features) ? JSON.stringify(features) : features || null;

    const vehicle = await prisma.vehicle.create({
      data: {
        ...rest,
        features: featuresString,
        services: serviceIds && serviceIds.length > 0
          ? {
              create: serviceIds.map((serviceId) => ({ serviceId })),
            }
          : undefined,
      },
      include: {
        images: true,
        rates: true,
        services: { include: { service: true } },
      },
    });

    await recordAuditLog({
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      action: "CREATE_VEHICLE",
      entity: "Vehicle",
      entityId: vehicle.id,
      metadata: { name: vehicle.name, slug: vehicle.slug },
    });

    return res.status(201).json({
      success: true,
      data: vehicle,
    });
  } catch (err) {
    next(err);
  }
}

// ADMIN: Update vehicle
export async function updateAdminVehicle(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const payload = updateVehicleSchema.parse(req.body);

    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Kendaraan tidak ditemukan." },
      });
    }

    if (payload.slug && payload.slug !== existing.slug) {
      const slugTaken = await prisma.vehicle.findUnique({ where: { slug: payload.slug } });
      if (slugTaken) {
        return res.status(400).json({
          success: false,
          error: { code: "SLUG_EXISTS", message: `Slug '${payload.slug}' sudah digunakan.` },
        });
      }
    }

    const { serviceIds, features, ...rest } = payload;
    const featuresString = features !== undefined
      ? Array.isArray(features) ? JSON.stringify(features) : features
      : undefined;

    // Handle service relations update if provided
    if (serviceIds) {
      await prisma.vehicleService.deleteMany({ where: { vehicleId: id } });
      if (serviceIds.length > 0) {
        await prisma.vehicleService.createMany({
          data: serviceIds.map((serviceId) => ({ vehicleId: id, serviceId })),
        });
      }
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        ...rest,
        ...(featuresString !== undefined ? { features: featuresString } : {}),
      },
      include: {
        images: true,
        rates: true,
        services: { include: { service: true } },
      },
    });

    await recordAuditLog({
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      action: "UPDATE_VEHICLE",
      entity: "Vehicle",
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

// ADMIN: Delete / Deactivate vehicle
export async function deleteAdminVehicle(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const existing = await prisma.vehicle.findUnique({
      where: { id },
      include: { _count: { select: { bookings: true } } },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Kendaraan tidak ditemukan." },
      });
    }

    // If vehicle has booking history, prioritize soft delete / deactivate to preserve data integrity
    if (existing._count.bookings > 0) {
      await prisma.vehicle.update({
        where: { id },
        data: { isActive: false },
      });

      await recordAuditLog({
        adminId: req.admin?.id,
        adminEmail: req.admin?.email,
        action: "DEACTIVATE_VEHICLE",
        entity: "Vehicle",
        entityId: id,
        metadata: { reason: "Has existing bookings" },
      });

      return res.status(200).json({
        success: true,
        data: {
          message: "Kendaraan memiliki riwayat booking dan telah dinonaktifkan dari katalog.",
        },
      });
    }

    // Permanent delete if clean
    await prisma.vehicle.delete({ where: { id } });

    await recordAuditLog({
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      action: "DELETE_VEHICLE",
      entity: "Vehicle",
      entityId: id,
    });

    return res.status(200).json({
      success: true,
      data: { message: "Kendaraan berhasil dihapus." },
    });
  } catch (err) {
    next(err);
  }
}

// ADMIN: Upload Vehicle Image
export async function uploadVehicleImage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: { code: "NO_FILE", message: "File gambar harus disertakan." },
      });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!vehicle) {
      deleteFile(file.path);
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Kendaraan tidak ditemukan." },
      });
    }

    const isFirstImage = vehicle.images.length === 0;
    const fileUrl = `/uploads/${file.filename}`;
    const altText = req.body.altText || `Foto armada ${vehicle.name}`;

    const newImage = await prisma.vehicleImage.create({
      data: {
        vehicleId: id,
        url: fileUrl,
        altText,
        isPrimary: isFirstImage,
        sortOrder: vehicle.images.length,
      },
    });

    await recordAuditLog({
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      action: "UPLOAD_VEHICLE_IMAGE",
      entity: "VehicleImage",
      entityId: newImage.id,
      metadata: { vehicleId: id, url: fileUrl },
    });

    return res.status(201).json({
      success: true,
      data: newImage,
    });
  } catch (err) {
    next(err);
  }
}

// ADMIN: Delete Vehicle Image
export async function deleteVehicleImage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id, imageId } = req.params;

    const img = await prisma.vehicleImage.findFirst({
      where: { id: imageId, vehicleId: id },
    });

    if (!img) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Foto tidak ditemukan." },
      });
    }

    deleteFile(img.url);
    await prisma.vehicleImage.delete({ where: { id: imageId } });

    // If deleted image was primary, make next image primary if any
    if (img.isPrimary) {
      const nextImg = await prisma.vehicleImage.findFirst({
        where: { vehicleId: id },
        orderBy: { sortOrder: "asc" },
      });
      if (nextImg) {
        await prisma.vehicleImage.update({
          where: { id: nextImg.id },
          data: { isPrimary: true },
        });
      }
    }

    await recordAuditLog({
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      action: "DELETE_VEHICLE_IMAGE",
      entity: "VehicleImage",
      entityId: imageId,
    });

    return res.status(200).json({
      success: true,
      data: { message: "Foto kendaraan berhasil dihapus." },
    });
  } catch (err) {
    next(err);
  }
}

// ADMIN: Set Primary Image
export async function setPrimaryVehicleImage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id, imageId } = req.params;

    const img = await prisma.vehicleImage.findFirst({
      where: { id: imageId, vehicleId: id },
    });

    if (!img) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Foto tidak ditemukan." },
      });
    }

    // Atomic transaction: unset all, set current as primary
    await prisma.$transaction([
      prisma.vehicleImage.updateMany({
        where: { vehicleId: id },
        data: { isPrimary: false },
      }),
      prisma.vehicleImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: { message: "Foto utama berhasil diperbarui." },
    });
  } catch (err) {
    next(err);
  }
}
