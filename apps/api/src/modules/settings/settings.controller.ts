import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { updateSettingsSchema } from "../../schemas/index.js";
import { recordAuditLog } from "../../middlewares/audit.middleware.js";

const DEFAULT_SETTINGS: Record<string, any> = {
  businessName: "TJ Rentcar",
  tagline: "Layanan Rental Mobil Profesional di Jakarta",
  city: "Jakarta",
  primaryServiceArea: "Jakarta",
  countryCode: "ID",
  locale: "id-ID",
  timezone: "Asia/Jakarta",
  currency: "IDR",
  siteUrl: "http://localhost:3000",
  logoUrl: null,
  publicAddress: null,
  showPublicAddress: false,
  publicCoordinates: null,
  whatsappNumber: null,
  phoneNumber: null,
  email: null,
  businessHours: "Senin - Minggu: 07:00 - 22:00 WIB",
  serviceAreas: [
    "Jakarta Pusat",
    "Jakarta Selatan",
    "Jakarta Barat",
    "Jakarta Timur",
    "Jakarta Utara",
    "Bandara Soekarno-Hatta (CGK)",
    "Bandara Halim Perdanakusuma (HLP)",
  ],
  airportRoutes: ["Bandara Soekarno-Hatta (CGK)", "Bandara Halim Perdanakusuma (HLP)"],
  outOfTownRoutes: ["Bandung", "Bogor", "Puncak", "Cirebon", "Semarang", "Yogyakarta", "Surabaya"],
  socialLinks: [],
  googleBusinessProfileUrl: null,
  metaTitle: "Rental Mobil Jakarta | TJ Rentcar",
  metaDescription:
    "Butuh rental mobil di Jakarta? Pilih layanan dengan sopir, lepas kunci, harian, mingguan, atau bulanan dari TJ Rentcar. Cek armada dan ajukan booking.",
  ogImageUrl: null,
};

export async function getPublicSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    let records: any[] = [];
    try {
      records = await prisma.siteSetting.findMany();
    } catch {
      // Graceful fallback to default settings if database is initializing or offline
      records = [];
    }
    const settingsMap: Record<string, any> = { ...DEFAULT_SETTINGS };

    for (const r of records) {
      try {
        settingsMap[r.key] = JSON.parse(r.value);
      } catch {
        settingsMap[r.key] = r.value;
      }
    }

    // Enforce privacy rule: Hide address and coordinates if showPublicAddress is false
    const showPublic = settingsMap.showPublicAddress === true;
    const sanitizedSettings = {
      businessName: settingsMap.businessName || "TJ Rentcar",
      tagline: settingsMap.tagline || "",
      city: settingsMap.city || "Jakarta",
      primaryServiceArea: settingsMap.primaryServiceArea || "Jakarta",
      countryCode: settingsMap.countryCode || "ID",
      locale: settingsMap.locale || "id-ID",
      timezone: settingsMap.timezone || "Asia/Jakarta",
      currency: settingsMap.currency || "IDR",
      siteUrl: settingsMap.siteUrl || "http://localhost:3000",
      logoUrl: settingsMap.logoUrl || null,
      publicAddress: showPublic ? settingsMap.publicAddress : null,
      showPublicAddress: showPublic,
      publicCoordinates: showPublic ? settingsMap.publicCoordinates : null,
      whatsappNumber: settingsMap.whatsappNumber || null,
      phoneNumber: settingsMap.phoneNumber || null,
      email: settingsMap.email || null,
      businessHours: settingsMap.businessHours || null,
      serviceAreas: settingsMap.serviceAreas || [],
      airportRoutes: settingsMap.airportRoutes || [],
      outOfTownRoutes: settingsMap.outOfTownRoutes || [],
      socialLinks: settingsMap.socialLinks || [],
      googleBusinessProfileUrl: settingsMap.googleBusinessProfileUrl || null,
      metaTitle: settingsMap.metaTitle || "Rental Mobil Jakarta | TJ Rentcar",
      metaDescription: settingsMap.metaDescription || "",
      ogImageUrl: settingsMap.ogImageUrl || null,
    };

    return res.status(200).json({
      success: true,
      data: sanitizedSettings,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAdminSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    const records = await prisma.siteSetting.findMany();
    const settingsMap: Record<string, any> = { ...DEFAULT_SETTINGS };

    for (const r of records) {
      try {
        settingsMap[r.key] = JSON.parse(r.value);
      } catch {
        settingsMap[r.key] = r.value;
      }
    }

    return res.status(200).json({
      success: true,
      data: settingsMap,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = updateSettingsSchema.parse(req.body);

    for (const [key, value] of Object.entries(payload)) {
      const stringified = typeof value === "string" ? JSON.stringify(value) : JSON.stringify(value);
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: stringified },
        create: { key, value: stringified },
      });
    }

    await recordAuditLog({
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      action: "UPDATE_SETTINGS",
      entity: "SiteSetting",
      metadata: Object.keys(payload),
    });

    return res.status(200).json({
      success: true,
      data: {
        message: "Pengaturan bisnis berhasil diperbarui.",
      },
    });
  } catch (err) {
    next(err);
  }
}
