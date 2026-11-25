import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { createRateSchema, updateRateSchema } from "../../schemas/index.js";
import { recordAuditLog } from "../../middlewares/audit.middleware.js";

export async function getRatesByVehicleId(req: Request, res: Response, next: NextFunction) {
  try {
    const { vehicleId } = req.params;
    const rates = await prisma.vehicleRate.findMany({
      where: { vehicleId },
      orderBy: [{ serviceType: "asc" }, { billingUnit: "asc" }],
    });

    return res.status(200).json({
      success: true,
      data: rates,
    });
  } catch (err) {
    next(err);
  }
}

export async function createRate(req: Request, res: Response, next: NextFunction) {
  try {
    const { vehicleId } = req.params;
    const payload = createRateSchema.parse(req.body);

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Kendaraan tidak ditemukan." },
      });
    }

    const existing = await prisma.vehicleRate.findUnique({
      where: {
        vehicleId_serviceType_billingUnit: {
          vehicleId,
          serviceType: payload.serviceType,
          billingUnit: payload.billingUnit,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: "RATE_EXISTS",
          message: `Tarif untuk jenis layanan ${payload.serviceType} dan durasi ${payload.billingUnit} sudah ada. Silakan perbarui tarif yang sudah ada.`,
        },
      });
    }

    const rate = await prisma.vehicleRate.create({
      data: {
        vehicleId,
        serviceType: payload.serviceType,
        billingUnit: payload.billingUnit,
        amount: payload.amount,
        isActive: payload.isActive,
        notes: payload.notes,
      },
    });

    await recordAuditLog({
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      action: "CREATE_RATE",
      entity: "VehicleRate",
      entityId: rate.id,
      metadata: { vehicleId, ...payload },
    });

    return res.status(201).json({
      success: true,
      data: rate,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateRate(req: Request, res: Response, next: NextFunction) {
  try {
    const { vehicleId, rateId } = req.params;
    const payload = updateRateSchema.parse(req.body);

    const existing = await prisma.vehicleRate.findFirst({
      where: { id: rateId, vehicleId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Data tarif tidak ditemukan." },
      });
    }

    const updated = await prisma.vehicleRate.update({
      where: { id: rateId },
      data: payload,
    });

    await recordAuditLog({
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      action: "UPDATE_RATE",
      entity: "VehicleRate",
      entityId: rateId,
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

export async function deleteRate(req: Request, res: Response, next: NextFunction) {
  try {
    const { vehicleId, rateId } = req.params;

    const existing = await prisma.vehicleRate.findFirst({
      where: { id: rateId, vehicleId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Data tarif tidak ditemukan." },
      });
    }

    await prisma.vehicleRate.delete({ where: { id: rateId } });

    await recordAuditLog({
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      action: "DELETE_RATE",
      entity: "VehicleRate",
      entityId: rateId,
    });

    return res.status(200).json({
      success: true,
      data: { message: "Tarif berhasil dihapus." },
    });
  } catch (err) {
    next(err);
  }
}
