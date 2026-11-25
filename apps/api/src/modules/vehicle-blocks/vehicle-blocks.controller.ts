import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { createBlockSchema, updateBlockSchema } from "../../schemas/index.js";
import { recordAuditLog } from "../../middlewares/audit.middleware.js";
import { BookingStatus } from "@prisma/client";

export async function getVehicleBlocks(req: Request, res: Response, next: NextFunction) {
  try {
    const { vehicleId } = req.query;

    const blocks = await prisma.vehicleBlock.findMany({
      where: vehicleId ? { vehicleId: vehicleId as string } : undefined,
      include: {
        vehicle: { select: { id: true, name: true, brand: true, model: true } },
        createdByAdmin: { select: { id: true, name: true, email: true } },
      },
      orderBy: { startAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: blocks,
    });
  } catch (err) {
    next(err);
  }
}

export async function createVehicleBlock(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = createBlockSchema.parse(req.body);
    const startAt = new Date(payload.startAt);
    const endAt = new Date(payload.endAt);

    if (endAt <= startAt) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_SCHEDULE", message: "Waktu selesai blokir harus setelah waktu mulai." },
      });
    }

    // Check if vehicle has CONFIRMED or IN_PROGRESS bookings overlapping
    const conflict = await prisma.booking.findFirst({
      where: {
        vehicleId: payload.vehicleId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] },
        pickupAt: { lt: endAt },
        returnAt: { gt: startAt },
      },
      select: { bookingCode: true },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        error: {
          code: "AVAILABILITY_CONFLICT",
          message: `Kendaraan memiliki booking terkonfirmasi (${conflict.bookingCode}) pada rentang jadwal ini. Harap atur ulang jadwal rental terlebih dahulu.`,
        },
      });
    }

    const block = await prisma.vehicleBlock.create({
      data: {
        vehicleId: payload.vehicleId,
        startAt,
        endAt,
        reason: payload.reason,
        note: payload.note,
        createdByAdminId: req.admin?.id || null,
      },
      include: { vehicle: true },
    });

    await recordAuditLog({
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      action: "CREATE_VEHICLE_BLOCK",
      entity: "VehicleBlock",
      entityId: block.id,
      metadata: payload,
    });

    return res.status(201).json({
      success: true,
      data: block,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteVehicleBlock(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const existing = await prisma.vehicleBlock.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Data blokir jadwal tidak ditemukan." },
      });
    }

    await prisma.vehicleBlock.delete({ where: { id } });

    await recordAuditLog({
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      action: "DELETE_VEHICLE_BLOCK",
      entity: "VehicleBlock",
      entityId: id,
    });

    return res.status(200).json({
      success: true,
      data: { message: "Blokir jadwal berhasil dihapus." },
    });
  } catch (err) {
    next(err);
  }
}
