import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { BookingStatus } from "@prisma/client";

export async function getCalendarData(req: Request, res: Response, next: NextFunction) {
  try {
    const { startAt, endAt, vehicleId } = req.query;

    const startDate = startAt ? new Date(startAt as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = endAt ? new Date(endAt as string) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    const bookingWhere: any = {
      pickupAt: { lte: endDate },
      returnAt: { gte: startDate },
    };

    const blockWhere: any = {
      startAt: { lte: endDate },
      endAt: { gte: startDate },
    };

    if (vehicleId) {
      bookingWhere.vehicleId = vehicleId as string;
      blockWhere.vehicleId = vehicleId as string;
    }

    const [bookings, blocks, vehicles] = await Promise.all([
      prisma.booking.findMany({
        where: bookingWhere,
        include: {
          vehicle: { select: { id: true, name: true, brand: true, model: true } },
        },
        orderBy: { pickupAt: "asc" },
      }),
      prisma.vehicleBlock.findMany({
        where: blockWhere,
        include: {
          vehicle: { select: { id: true, name: true } },
          createdByAdmin: { select: { name: true, email: true } },
        },
        orderBy: { startAt: "asc" },
      }),
      prisma.vehicle.findMany({
        select: { id: true, name: true, brand: true, model: true, isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    const confirmedOrActive = bookings.filter(
      (b) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.IN_PROGRESS
    );
    const pending = bookings.filter((b) => b.status === BookingStatus.PENDING);

    return res.status(200).json({
      success: true,
      data: {
        confirmedBookings: confirmedOrActive,
        pendingBookings: pending,
        vehicleBlocks: blocks,
        vehicles,
      },
    });
  } catch (err) {
    next(err);
  }
}
