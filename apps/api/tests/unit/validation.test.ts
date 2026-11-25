import { describe, it, expect } from "vitest";
import { isValidWhatsAppNumber, normalizePhoneNumber } from "../../src/utils/phone.js";
import {
  collapseWhitespace,
  getPersonNameError,
  normalizeEmail,
} from "../../src/utils/validation.js";
import { contactSchema, createBookingSchema } from "../../src/schemas/index.js";

const VALID_BOOKING = {
  vehicleId: "vehicle-1",
  customerName: "Budi Santoso",
  customerPhone: "081377712345",
  customerEmail: "",
  serviceType: "WITH_DRIVER",
  billingUnit: "DAILY",
  pickupAt: "2026-12-01T09:00:00.000Z",
  returnAt: "2026-12-02T09:00:00.000Z",
  pickupLocation: "Hotel Mulia Senayan",
  returnLocation: "",
  customerNote: "",
  acceptedTerms: true,
};

describe("Validation: customer name", () => {
  it("rejects empty, whitespace-only, and too short names", () => {
    expect(getPersonNameError("")).toBeTruthy();
    expect(getPersonNameError("   ")).toBeTruthy();
    expect(getPersonNameError("A")).toBeTruthy();
  });

  it("rejects digits only, symbols only, and mixed digits", () => {
    expect(getPersonNameError("12345")).toBeTruthy();
    expect(getPersonNameError("!!!@@@")).toBeTruthy();
    expect(getPersonNameError("Budi2")).toBeTruthy();
  });

  it("rejects URL and email-like values", () => {
    expect(getPersonNameError("https://tjrentcar.com")).toBeTruthy();
    expect(getPersonNameError("budi@mail.com")).toBeTruthy();
  });

  it("rejects names longer than 80 characters", () => {
    expect(getPersonNameError("A".repeat(81))).toBeTruthy();
  });

  it("accepts normal Indonesian names", () => {
    expect(getPersonNameError("Budi Santoso")).toBeNull();
    expect(getPersonNameError("Rizky-Nur'Aini")).toBeNull();
    expect(getPersonNameError("Muhammad Rizky Pratama")).toBeNull();
    expect(getPersonNameError("José Álvarez")).toBeNull();
  });

  it("collapses extra whitespace before validation and storage", () => {
    expect(collapseWhitespace("  Budi    Santoso  ")).toBe("Budi Santoso");
    expect(getPersonNameError(collapseWhitespace("  Budi    Santoso  "))).toBeNull();
  });
});

describe("Validation: WhatsApp number", () => {
  it("accepts 08, 62, and +62 formats", () => {
    expect(isValidWhatsAppNumber("081377712345")).toBe(true);
    expect(isValidWhatsAppNumber("6281377712345")).toBe(true);
    expect(isValidWhatsAppNumber("+62 813-7771-2345")).toBe(true);
  });

  it("normalizes accepted formats consistently", () => {
    expect(normalizePhoneNumber("081377712345")).toBe("6281377712345");
    expect(normalizePhoneNumber("+62 813-7771-2345")).toBe("6281377712345");
  });

  it("rejects numbers that are too short or too long", () => {
    expect(isValidWhatsAppNumber("0813")).toBe(false);
    expect(isValidWhatsAppNumber("0813777123456789")).toBe(false);
  });

  it("rejects letters and symbols", () => {
    expect(isValidWhatsAppNumber("0812abc4567")).toBe(false);
    expect(isValidWhatsAppNumber("bukan nomor")).toBe(false);
    expect(isValidWhatsAppNumber("0813/7771/2345")).toBe(false);
  });

  it("rejects obvious dummy patterns", () => {
    expect(isValidWhatsAppNumber("080000000000")).toBe(false);
    expect(isValidWhatsAppNumber("081111111111")).toBe(false);
    expect(isValidWhatsAppNumber("081234567890")).toBe(false);
    expect(isValidWhatsAppNumber("0812345678")).toBe(false);
  });

  it("rejects landlines and unknown international numbers for WhatsApp", () => {
    expect(isValidWhatsAppNumber("0211234567")).toBe(false);
    expect(isValidWhatsAppNumber("+15551234567")).toBe(false);
  });

  it("keeps backward compatibility with legacy stored format", () => {
    // normalizePhoneNumber must stay idempotent for existing 62... data.
    expect(normalizePhoneNumber("6281377712345")).toBe("6281377712345");
    expect(normalizePhoneNumber("0813-7771-2345")).toBe("6281377712345");
  });
});

describe("Validation: email", () => {
  it("treats empty values as null", () => {
    expect(normalizeEmail("")).toBeNull();
    expect(normalizeEmail("   ")).toBeNull();
    expect(normalizeEmail(null)).toBeNull();
    expect(normalizeEmail(undefined)).toBeNull();
  });

  it("trims and lowercases valid email", () => {
    expect(normalizeEmail("  Budi@Example.COM ")).toBe("budi@example.com");
  });
});

describe("Validation: createBookingSchema", () => {
  it("rejects invalid customer fields with field-level issues", () => {
    const result = createBookingSchema.safeParse({
      ...VALID_BOOKING,
      customerName: "12",
      customerPhone: "abc",
      pickupLocation: " ",
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    const fields = result.error.errors.map((issue) => issue.path.join("."));
    expect(fields).toContain("customerName");
    expect(fields).toContain("customerPhone");
    expect(fields).toContain("pickupLocation");
  });

  it("rejects invalid email but accepts empty email as null", () => {
    const invalid = createBookingSchema.safeParse({
      ...VALID_BOOKING,
      customerEmail: "not-an-email",
    });
    expect(invalid.success).toBe(false);

    const valid = createBookingSchema.safeParse({ ...VALID_BOOKING, customerEmail: "" });
    expect(valid.success).toBe(true);
    if (valid.success) expect(valid.data.customerEmail).toBeNull();
  });

  it("normalizes valid payload before storage", () => {
    const result = createBookingSchema.safeParse({
      ...VALID_BOOKING,
      customerName: "  Budi    Santoso  ",
      customerPhone: "0813-7771-2345",
      pickupLocation: "  Hotel   Mulia  ",
      returnLocation: "   ",
      customerNote: "   ",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.customerName).toBe("Budi Santoso");
    expect(result.data.customerPhone).toBe("6281377712345");
    expect(result.data.pickupLocation).toBe("Hotel Mulia");
    expect(result.data.returnLocation).toBeNull();
    expect(result.data.customerNote).toBeNull();
  });
});

describe("Validation: contactSchema", () => {
  it("rejects invalid name, phone, email, and message", () => {
    const result = contactSchema.safeParse({
      name: "A1",
      contact: "12345",
      email: "bad@",
      message: "Hi",
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    const fields = result.error.errors.map((issue) => issue.path.join("."));
    expect(fields).toContain("name");
    expect(fields).toContain("contact");
    expect(fields).toContain("email");
    expect(fields).toContain("message");
  });

  it("normalizes a valid contact payload", () => {
    const result = contactSchema.safeParse({
      name: "  Rizky   Nur'Aini ",
      contact: "+62 813-7771-2345",
      email: "  RIZKY@Example.com ",
      message: "  Halo, saya ingin sewa Avanza.  ",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.name).toBe("Rizky Nur'Aini");
    expect(result.data.contact).toBe("6281377712345");
    expect(result.data.email).toBe("rizky@example.com");
    expect(result.data.message).toBe("Halo, saya ingin sewa Avanza.");
  });
});
