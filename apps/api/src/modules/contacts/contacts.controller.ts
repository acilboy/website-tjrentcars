import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { contactSchema } from "../../schemas/index.js";
import { ContactStatus } from "@prisma/client";

// PUBLIC: Submit contact message
export async function submitPublicContact(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = contactSchema.parse(req.body);

    const message = await prisma.contactMessage.create({
      data: {
        name: payload.name,
        contact: payload.contact,
        email: payload.email || null,
        message: payload.message,
        status: ContactStatus.NEW,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        id: message.id,
        message: "Pesan Anda telah berhasil dikirim. Tim TJ Rentcar akan segera merespons.",
      },
    });
  } catch (err) {
    next(err);
  }
}

// ADMIN: Get contact messages
export async function getAdminContactMessages(_req: Request, res: Response, next: NextFunction) {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
}

// ADMIN: Update contact message status
export async function updateAdminContactStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status },
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}
