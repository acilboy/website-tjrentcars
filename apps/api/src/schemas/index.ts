import { z } from "zod";
import {
  ServiceType,
  BillingUnit,
  Transmission,
  BookingStatus,
  PaymentStatus,
  BlockReason,
  ArticleStatus,
  Role,
} from "@prisma/client";
import { isValidWhatsAppNumber, normalizePhoneNumber } from "../utils/phone.js";
import {
  MESSAGE_MAX,
  MESSAGE_MIN,
  NOTE_MAX,
  LOCATION_MAX,
  LOCATION_MIN,
  collapseWhitespace,
  getEmailError,
  getOptionalTextError,
  getPersonNameError,
  getRequiredTextError,
  normalizeEmail,
} from "../utils/validation.js";

// ---------------------------------------------------------------------------
// Reusable customer input fields (frontend mirrors these rules in
// apps/web/lib/validation.ts; the API schema stays the authoritative source).
// ---------------------------------------------------------------------------

function trimmedString(label: string) {
  return z
    .string({
      required_error: `${label} wajib diisi.`,
      invalid_type_error: `${label} harus berupa teks.`,
    })
    .transform((value) => value.trim());
}

export const personNameSchema = trimmedString("Nama lengkap")
  .transform(collapseWhitespace)
  .superRefine((value, ctx) => {
    const message = getPersonNameError(value);
    if (message) ctx.addIssue({ code: z.ZodIssueCode.custom, message });
  });

export const whatsAppNumberSchema = trimmedString("Nomor WhatsApp")
  .superRefine((value, ctx) => {
    if (!isValidWhatsAppNumber(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Nomor WhatsApp tidak valid. Gunakan nomor Indonesia yang aktif, contoh: 081234567890.",
      });
    }
  })
  .transform(normalizePhoneNumber);

export const optionalEmailSchema = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => normalizeEmail(value))
  .superRefine((value, ctx) => {
    const message = getEmailError(value);
    if (message) ctx.addIssue({ code: z.ZodIssueCode.custom, message });
  });

export const pickupLocationSchema = trimmedString("Alamat penjemputan")
  .transform(collapseWhitespace)
  .superRefine((value, ctx) => {
    const message = getRequiredTextError(
      value,
      "Alamat penjemputan",
      LOCATION_MIN,
      LOCATION_MAX
    );
    if (message) ctx.addIssue({ code: z.ZodIssueCode.custom, message });
  });

export const optionalLocationSchema = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => collapseWhitespace(value ?? ""))
  .transform((value) => (value === "" ? null : value))
  .superRefine((value, ctx) => {
    if (value === null) return;
    const message = getOptionalTextError(value, "Lokasi pengembalian", LOCATION_MAX);
    if (message) ctx.addIssue({ code: z.ZodIssueCode.custom, message });
  });

export const optionalCustomerNoteSchema = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => collapseWhitespace(value ?? ""))
  .transform((value) => (value === "" ? null : value))
  .superRefine((value, ctx) => {
    if (value === null) return;
    const message = getOptionalTextError(value, "Catatan tambahan", NOTE_MAX);
    if (message) ctx.addIssue({ code: z.ZodIssueCode.custom, message });
  });

export const contactMessageBodySchema = trimmedString("Pesan")
  .superRefine((value, ctx) => {
    const message = getRequiredTextError(value, "Pesan", MESSAGE_MIN, MESSAGE_MAX);
    if (message) ctx.addIssue({ code: z.ZodIssueCode.custom, message });
  });

// Auth
export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid").toLowerCase().trim(),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

// Vehicle
export const vehicleQuerySchema = z.object({
  search: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  transmission: z.nativeEnum(Transmission).optional(),
  seats: z.coerce.number().optional(),
  serviceType: z.nativeEnum(ServiceType).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(["price_asc", "price_desc", "name_asc", "newest"]).default("newest"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
});

export const createVehicleSchema = z.object({
  name: z.string().min(2, "Nama kendaraan wajib diisi").trim(),
  slug: z.string().min(2).trim(),
  brand: z.string().min(1, "Merek kendaraan wajib diisi").trim(),
  model: z.string().min(1, "Model kendaraan wajib diisi").trim(),
  year: z.number().int().min(1990).max(2035).optional().nullable(),
  category: z.string().min(1, "Kategori kendaraan wajib diisi").trim(),
  transmission: z.nativeEnum(Transmission).optional().nullable(),
  seats: z.number().int().min(1).max(60).optional().nullable(),
  doors: z.number().int().min(1).max(10).optional().nullable(),
  fuelType: z.string().optional().nullable(),
  luggageCapacity: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  features: z.array(z.string()).or(z.string()).optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  metaTitle: z.string().max(100).optional().nullable(),
  metaDescription: z.string().max(250).optional().nullable(),
  ogImageUrl: z.string().url().optional().nullable(),
  canonicalPath: z.string().optional().nullable(),
  robotsIndex: z.boolean().default(true),
  robotsFollow: z.boolean().default(true),
  focusKeyword: z.string().optional().nullable(),
  serviceIds: z.array(z.string()).optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

// Rates
export const createRateSchema = z.object({
  serviceType: z.nativeEnum(ServiceType),
  billingUnit: z.nativeEnum(BillingUnit),
  amount: z.number().int().min(0, "Tarif harus bilangan bulat non-negatif"),
  isActive: z.boolean().default(true),
  notes: z.string().optional().nullable(),
});

export const updateRateSchema = createRateSchema.partial();

// Services
export const createServiceSchema = z.object({
  title: z.string().min(2, "Judul layanan wajib diisi").trim(),
  slug: z.string().min(2).trim(),
  shortDescription: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  metaTitle: z.string().max(100).optional().nullable(),
  metaDescription: z.string().max(250).optional().nullable(),
  ogImageUrl: z.string().optional().nullable(),
  canonicalPath: z.string().optional().nullable(),
  robotsIndex: z.boolean().default(true),
  robotsFollow: z.boolean().default(true),
  focusKeyword: z.string().optional().nullable(),
});

export const updateServiceSchema = createServiceSchema.partial();

// Availability
export const availabilityQuerySchema = z.object({
  pickupAt: z.string().datetime({ message: "Format tanggal mulai ISO 8601 tidak valid" }),
  returnAt: z.string().datetime({ message: "Format tanggal selesai ISO 8601 tidak valid" }),
  serviceType: z.nativeEnum(ServiceType).optional().default(ServiceType.WITH_DRIVER),
  billingUnit: z.nativeEnum(BillingUnit).optional().default(BillingUnit.DAILY),
});

// Bookings
export const createBookingSchema = z.object({
  vehicleId: z.string().min(1, "Kendaraan harus dipilih"),
  customerName: personNameSchema,
  customerPhone: whatsAppNumberSchema,
  customerEmail: optionalEmailSchema,
  serviceType: z.nativeEnum(ServiceType),
  billingUnit: z.nativeEnum(BillingUnit).default(BillingUnit.DAILY),
  pickupAt: z.string().datetime({ message: "Format tanggal jemput ISO 8601 tidak valid" }),
  returnAt: z.string().datetime({ message: "Format tanggal kembali ISO 8601 tidak valid" }),
  pickupLocation: pickupLocationSchema,
  returnLocation: optionalLocationSchema,
  customerNote: optionalCustomerNoteSchema,
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: "Anda harus menyetujui syarat & ketentuan serta kebijakan privasi." }),
  }),
});

export const updateBookingStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  amountPaid: z.number().int().min(0).optional().nullable(),
});

export const updateBookingNotesSchema = z.object({
  adminNote: z.string().max(2000).optional().nullable(),
});

export const bookingQuerySchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(BookingStatus).optional(),
  vehicleId: z.string().optional(),
  serviceType: z.nativeEnum(ServiceType).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// Vehicle Blocks (Maintenance)
export const createBlockSchema = z.object({
  vehicleId: z.string().min(1, "Kendaraan harus dipilih"),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  reason: z.nativeEnum(BlockReason).default(BlockReason.MAINTENANCE),
  note: z.string().max(1000).optional().nullable(),
});

export const updateBlockSchema = createBlockSchema.partial();

// Pages
export const pageSchema = z.object({
  title: z.string().min(2).trim(),
  slug: z.string().min(2).trim(),
  content: z.string().min(5),
  isPublished: z.boolean().default(true),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  ogImageUrl: z.string().optional().nullable(),
  canonicalPath: z.string().optional().nullable(),
  robotsIndex: z.boolean().default(true),
  robotsFollow: z.boolean().default(true),
});

// FAQs
export const faqSchema = z.object({
  question: z.string().min(5).trim(),
  answer: z.string().min(5).trim(),
  category: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

// Articles
export const articleSchema = z.object({
  title: z.string().min(3).trim(),
  slug: z.string().min(3).trim(),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(10),
  featuredImageUrl: z.string().optional().nullable(),
  featuredImageAlt: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  authorName: z.string().optional().nullable(),
  status: z.nativeEnum(ArticleStatus).default(ArticleStatus.DRAFT),
  publishedAt: z.string().datetime().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  ogImageUrl: z.string().optional().nullable(),
  canonicalPath: z.string().optional().nullable(),
  robotsIndex: z.boolean().default(true),
  robotsFollow: z.boolean().default(true),
  focusKeyword: z.string().optional().nullable(),
});

// Testimonials
export const testimonialSchema = z.object({
  customerName: z.string().min(2).trim(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  review: z.string().min(5).trim(),
  isPublished: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

// Settings
export const updateSettingsSchema = z.record(z.any());

// Contact
export const contactSchema = z.object({
  name: personNameSchema,
  contact: whatsAppNumberSchema,
  email: optionalEmailSchema,
  message: contactMessageBodySchema,
});
