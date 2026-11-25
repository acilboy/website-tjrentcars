import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import {
  createBookingSchema,
  updateBookingStatusSchema,
  updateBookingNotesSchema,
  bookingQuerySchema,
} from "../../schemas/index.js";
import { generateBookingCode } from "../../utils/booking-code.js";
import { calculatePriceAndBreakdown } from "../../utils/pricing.js";
import { recordAuditLog } from "../../middlewares/audit.middleware.js";
import { BookingStatus, Prisma } from "@prisma/client";

// PUBLIC: Create new booking request (ALWAYS PENDING)
export async function createPublicBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = createBookingSchema.parse(req.body);

    const pickupAt = new Date(payload.pickupAt);
    const returnAt = new Date(payload.returnAt);

    if (returnAt <= pickupAt) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_SCHEDULE",
          message: "Tanggal selesai rental harus setelah tanggal penjemputan.",
        },
      });
    }

    // Ensure vehicle exists and is active
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: payload.vehicleId },
      include: {
        rates: {
          where: {
            serviceType: payload.serviceType,
            billingUnit: payload.billingUnit,
            isActive: true,
          },
        },
      },
    });

    if (!vehicle || !vehicle.isActive) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Kendaraan yang dipilih tidak aktif atau tidak ditemukan." },
      });
    }

    // Check availability conflict with CONFIRMED or IN_PROGRESS bookings
    const existingConflict = await prisma.booking.findFirst({
      where: {
        vehicleId: payload.vehicleId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] },
        pickupAt: { lt: returnAt },
        returnAt: { gt: pickupAt },
      },
    });

    // Check conflict with maintenance block
    const existingBlock = await prisma.vehicleBlock.findFirst({
      where: {
        vehicleId: payload.vehicleId,
        startAt: { lt: returnAt },
        endAt: { gt: pickupAt },
      },
    });

    if (existingConflict || existingBlock) {
      return res.status(409).json({
        success: false,
        error: {
          code: "AVAILABILITY_CONFLICT",
          message: "Jadwal yang Anda pilih berbenturan dengan reservasi terkonfirmasi atau jadwal pemeliharaan kendaraan. Silakan pilih tanggal atau kendaraan lain.",
        },
      });
    }

    // customerPhone is already normalized by createBookingSchema (.transform)
    const bookingCode = generateBookingCode();

    // Server-side price calculation
    const activeRate = vehicle.rates[0]?.amount || null;
    const pricing = calculatePriceAndBreakdown(
      pickupAt,
      returnAt,
      payload.serviceType,
      payload.billingUnit,
      activeRate
    );

    // Save booking with strictly PENDING status
    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        vehicleId: payload.vehicleId,
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        customerEmail: payload.customerEmail || null,
        serviceType: payload.serviceType,
        billingUnit: payload.billingUnit,
        pickupAt,
        returnAt,
        pickupLocation: payload.pickupLocation,
        returnLocation: payload.returnLocation || null,
        durationUnits: pricing.durationUnits,
        estimatedTotal: pricing.estimatedTotal,
        priceBreakdown: JSON.stringify(pricing.priceBreakdown),
        customerNote: payload.customerNote || null,
        termsAcceptedAt: new Date(),
        termsVersion: "v1.0-2026",
        status: BookingStatus.PENDING,
      },
      include: {
        vehicle: {
          select: {
            name: true,
            brand: true,
            model: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        bookingCode: booking.bookingCode,
        status: booking.status,
        vehicleName: booking.vehicle.name,
        customerName: booking.customerName,
        pickupAt: booking.pickupAt.toISOString(),
        returnAt: booking.returnAt.toISOString(),
        durationUnits: booking.durationUnits,
        estimatedTotal: booking.estimatedTotal,
        quotationRequired: pricing.quotationRequired,
        message: "Permintaan booking Anda telah berhasil dicatat dengan status PENDING. Admin kami akan segera memeriksa ketersediaan dan menghubungi Anda untuk konfirmasi.",
      },
    });
  } catch (err) {
    next(err);
  }
}

// ADMIN: List bookings with filters & pagination
export async function getAdminBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const query = bookingQuerySchema.parse(req.query);
    const { search, status, vehicleId, serviceType, startDate, endDate, page, limit } = query;

    const where: Prisma.BookingWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    if (serviceType) {
      where.serviceType = serviceType;
    }

    if (search) {
      where.OR = [
        { bookingCode: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
      ];
    }

    if (startDate) {
      where.pickupAt = { gte: new Date(startDate) };
    }

    if (endDate) {
      where.returnAt = { lte: new Date(endDate) };
    }

    const total = await prisma.booking.count({ where });

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            brand: true,
            model: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return res.status(200).json({
      success: true,
      data: bookings,
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

// ADMIN: Get booking detail
export async function getAdminBookingById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        vehicle: {
          include: {
            images: { where: { isPrimary: true } },
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Data booking tidak ditemukan." },
      });
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
}

// ADMIN: Update booking status with atomic conflict check
export async function updateAdminBookingStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status: newStatus, paymentStatus, amountPaid } = updateBookingStatusSchema.parse(req.body);

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Booking tidak ditemukan." },
      });
    }

    // Validate state transition
    const current = booking.status;
    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.REJECTED, BookingStatus.CANCELLED],
      [BookingStatus.CONFIRMED]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
      [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED],
      [BookingStatus.COMPLETED]: [],
      [BookingStatus.REJECTED]: [],
      [BookingStatus.CANCELLED]: [],
    };

    if (newStatus !== current && !validTransitions[current]?.includes(newStatus)) {
      return res.status(409).json({
        success: false,
        error: {
          code: "INVALID_STATUS_TRANSITION",
          message: `Perubahan status dari '${current}' ke '${newStatus}' tidak diizinkan.`,
        },
      });
    }

    // ATOMIC TRANSACTION: If confirming booking, check overlap inside transaction
    const updatedBooking = await prisma.$transaction(async (tx) => {
      if (newStatus === BookingStatus.CONFIRMED && current !== BookingStatus.CONFIRMED) {
        // Check for conflicting confirmed bookings for the same vehicle
        const conflict = await tx.booking.findFirst({
          where: {
            id: { not: booking.id },
            vehicleId: booking.vehicleId,
            status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] },
            pickupAt: { lt: booking.returnAt },
            returnAt: { gt: booking.pickupAt },
          },
        });

        if (conflict) {
          throw new Error("CONFLICT_BOOKING");
        }

        // Check for maintenance block
        const blockConflict = await tx.vehicleBlock.findFirst({
          where: {
            vehicleId: booking.vehicleId,
            startAt: { lt: booking.returnAt },
            endAt: { gt: booking.pickupAt },
          },
        });

        if (blockConflict) {
          throw new Error("CONFLICT_BLOCK");
        }
      }

      const updateData: Prisma.BookingUpdateInput = {
        status: newStatus,
        paymentStatus: paymentStatus || booking.paymentStatus,
        amountPaid: amountPaid !== undefined ? amountPaid : booking.amountPaid,
      };

      if (newStatus === BookingStatus.CONFIRMED) {
        updateData.confirmedAt = new Date();
      } else if (newStatus === BookingStatus.CANCELLED) {
        updateData.cancelledAt = new Date();
      }

      return tx.booking.update({
        where: { id },
        data: updateData,
        include: { vehicle: true },
      });
    });

    await recordAuditLog({
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      action: "UPDATE_BOOKING_STATUS",
      entity: "Booking",
      entityId: id,
      metadata: { from: current, to: newStatus, paymentStatus, amountPaid },
    });

    return res.status(200).json({
      success: true,
      data: updatedBooking,
    });
  } catch (err: any) {
    if (err.message === "CONFLICT_BOOKING") {
      return res.status(409).json({
        success: false,
        error: {
          code: "AVAILABILITY_CONFLICT",
          message: "Tidak dapat mengonfirmasi booking: Terdapat booking lain yang sudah terkonfirmasi pada jadwal dan unit yang sama.",
        },
      });
    }
    if (err.message === "CONFLICT_BLOCK") {
      return res.status(409).json({
        success: false,
        error: {
          code: "AVAILABILITY_CONFLICT",
          message: "Tidak dapat mengonfirmasi booking: Kendaraan berada dalam periode pemeliharaan (maintenance) pada jadwal ini.",
        },
      });
    }
    next(err);
  }
}

// ADMIN: Update internal admin notes
export async function updateAdminBookingNotes(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { adminNote } = updateBookingNotesSchema.parse(req.body);

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Booking tidak ditemukan." },
      });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { adminNote },
    });

    await recordAuditLog({
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      action: "UPDATE_BOOKING_ADMIN_NOTE",
      entity: "Booking",
      entityId: id,
    });

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}
