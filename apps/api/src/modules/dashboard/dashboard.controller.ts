import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { BookingStatus, ContactStatus } from "@prisma/client";

export async function getDashboardStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date();

    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      inProgressBookings,
      completedBookings,
      activeVehicles,
      totalVehicles,
      activeBlocks,
      recentBookings,
      unreadMessages,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
      prisma.booking.count({ where: { status: BookingStatus.CONFIRMED } }),
      prisma.booking.count({ where: { status: BookingStatus.IN_PROGRESS } }),
      prisma.booking.count({ where: { status: BookingStatus.COMPLETED } }),
      prisma.vehicle.count({ where: { isActive: true } }),
      prisma.vehicle.count(),
      prisma.vehicleBlock.count({
        where: {
          startAt: { lte: now },
          endAt: { gte: now },
        },
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          vehicle: { select: { name: true } },
        },
      }),
      prisma.contactMessage.count({ where: { status: ContactStatus.NEW } }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        inProgressBookings,
        completedBookings,
        activeVehicles,
        totalVehicles,
        maintenanceVehicles: activeBlocks,
        unreadMessages,
        recentBookings,
      },
    });
  } catch (err) {
    next(err);
  }
}
