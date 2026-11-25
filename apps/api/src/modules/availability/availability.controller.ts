import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { availabilityQuerySchema } from "../../schemas/index.js";
import { calculatePriceAndBreakdown } from "../../utils/pricing.js";
import { BookingStatus } from "@prisma/client";

export async function checkVehicleAvailability(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: vehicleId } = req.params;
    const { pickupAt: pickupRaw, returnAt: returnRaw, serviceType, billingUnit } = availabilityQuerySchema.parse(
      req.query
    );

    const pickupAt = new Date(pickupRaw);
    const returnAt = new Date(returnRaw);

    if (returnAt <= pickupAt) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_SCHEDULE",
          message: "Tanggal selesai rental harus setelah tanggal penjemputan.",
        },
      });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        rates: {
          where: {
            serviceType,
            billingUnit,
            isActive: true,
          },
        },
      },
    });

    if (!vehicle || !vehicle.isActive) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Kendaraan tidak ditemukan atau sedang tidak aktif." },
      });
    }

    // Check conflict against CONFIRMED and IN_PROGRESS bookings
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        vehicleId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] },
        pickupAt: { lt: returnAt },
        returnAt: { gt: pickupAt },
      },
      select: { id: true }, // privacy: only select id to check presence
    });

    // Check conflict against VehicleBlock (maintenance)
    const conflictingBlock = await prisma.vehicleBlock.findFirst({
      where: {
        vehicleId,
        startAt: { lt: returnAt },
        endAt: { gt: pickupAt },
      },
      select: { id: true, reason: true },
    });

    const isAvailable = !conflictingBooking && !conflictingBlock;

    // Calculate price estimate
    const activeRate = vehicle.rates[0]?.amount || null;
    const pricing = calculatePriceAndBreakdown(
      pickupAt,
      returnAt,
      serviceType,
      billingUnit,
      activeRate
    );

    return res.status(200).json({
      success: true,
      data: {
        vehicleId,
        vehicleName: vehicle.name,
        available: isAvailable,
        conflictReason: !isAvailable
          ? conflictingBlock
            ? "Kendaraan dalam jadwal pemeliharaan (maintenance) pada rentang waktu ini."
            : "Kendaraan sudah terkonfirmasi dipesan pada rentang jadwal ini."
          : null,
        durationDays: pricing.durationDays,
        durationUnits: pricing.durationUnits,
        unitName: pricing.unitName,
        unitAmount: pricing.unitAmount,
        estimatedTotal: pricing.estimatedTotal,
        quotationRequired: pricing.quotationRequired,
        currency: "IDR",
        pickupAt: pickupAt.toISOString(),
        returnAt: returnAt.toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}
