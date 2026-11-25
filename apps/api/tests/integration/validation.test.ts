import { describe, it, expect, vi, afterEach } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { prisma } from "../../src/lib/prisma.js";

const VALID_BOOKING = {
  vehicleId: "vehicle-1",
  customerName: "Budi Santoso",
  customerPhone: "081377712345",
  customerEmail: null,
  serviceType: "WITH_DRIVER",
  billingUnit: "DAILY",
  pickupAt: "2026-12-01T09:00:00.000Z",
  returnAt: "2026-12-02T09:00:00.000Z",
  pickupLocation: "Hotel Mulia Senayan",
  returnLocation: null,
  customerNote: null,
  acceptedTerms: true,
};

const VALID_CONTACT = {
  name: "Rizky Nur'Aini",
  contact: "081377712345",
  email: null,
  message: "Halo, saya ingin menyewa Avanza untuk akhir pekan.",
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Integration: booking customer validation", () => {
  it("rejects invalid customer payload even when the frontend is bypassed", async () => {
    const createSpy = vi.spyOn(prisma.booking, "create").mockResolvedValue({} as any);

    const res = await request(app)
      .post("/api/v1/public/bookings")
      .send({
        ...VALID_BOOKING,
        customerName: "12345",
        customerPhone: "0812abc",
        pickupLocation: "   ",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");

    const fields = (res.body.error.details as Array<{ field: string }>).map((d) => d.field);
    expect(fields).toContain("customerName");
    expect(fields).toContain("customerPhone");
    expect(fields).toContain("pickupLocation");

    // Invalid requests must never reach the database.
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("rejects an invalid optional email but allows an empty one", async () => {
    const res = await request(app)
      .post("/api/v1/public/bookings")
      .send({ ...VALID_BOOKING, customerEmail: "bukan-email" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    const fields = (res.body.error.details as Array<{ field: string }>).map((d) => d.field);
    expect(fields).toContain("customerEmail");
  });

  it("stores a valid booking with normalized phone and trimmed name", async () => {
    vi.spyOn(prisma.vehicle, "findUnique").mockResolvedValue({
      id: "vehicle-1",
      isActive: true,
      name: "Toyota Avanza",
      brand: "Toyota",
      model: "Avanza",
      rates: [{ amount: 500000 }],
    } as any);
    vi.spyOn(prisma.booking, "findFirst").mockResolvedValue(null);
    vi.spyOn(prisma.vehicleBlock, "findFirst").mockResolvedValue(null);

    const createSpy = vi.spyOn(prisma.booking, "create").mockImplementation(async (args: any) => {
      return {
        id: "booking-1",
        bookingCode: "TJ-ABCD1234",
        status: "PENDING",
        customerName: args.data.customerName,
        customerPhone: args.data.customerPhone,
        customerEmail: args.data.customerEmail,
        pickupAt: args.data.pickupAt,
        returnAt: args.data.returnAt,
        durationUnits: args.data.durationUnits,
        estimatedTotal: args.data.estimatedTotal,
        vehicle: { name: "Toyota Avanza", brand: "Toyota", model: "Avanza" },
      } as any;
    });

    const res = await request(app)
      .post("/api/v1/public/bookings")
      .send({
        ...VALID_BOOKING,
        customerName: "  Budi    Santoso ",
        customerPhone: "+62 813-7771-2345",
        pickupLocation: "  Hotel   Mulia  ",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("PENDING");
    expect(createSpy).toHaveBeenCalledTimes(1);

    const storedData = createSpy.mock.calls[0][0] as any;
    expect(storedData.data.customerPhone).toBe("6281377712345");
    expect(storedData.data.customerName).toBe("Budi Santoso");
    expect(storedData.data.pickupLocation).toBe("Hotel Mulia");
    expect(storedData.data.customerEmail).toBeNull();
    expect(storedData.data.status).toBe("PENDING");
  });
});

describe("Integration: contact validation", () => {
  it("rejects invalid contact payload and creates no record", async () => {
    const createSpy = vi.spyOn(prisma.contactMessage, "create").mockResolvedValue({} as any);

    const res = await request(app)
      .post("/api/v1/public/contact")
      .send({
        name: "!!",
        contact: "123",
        email: "not-an-email",
        message: "Hi",
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");

    const fields = (res.body.error.details as Array<{ field: string }>).map((d) => d.field);
    expect(fields).toContain("name");
    expect(fields).toContain("contact");
    expect(fields).toContain("email");
    expect(fields).toContain("message");

    expect(createSpy).not.toHaveBeenCalled();
  });

  it("stores a valid contact message with normalized phone", async () => {
    const createSpy = vi
      .spyOn(prisma.contactMessage, "create")
      .mockResolvedValue({ id: "contact-1" } as any);

    const res = await request(app)
      .post("/api/v1/public/contact")
      .send({
        ...VALID_CONTACT,
        name: "  Rizky   Nur'Aini ",
        contact: "+62 813-7771-2345",
        email: "  RIZKY@Example.com ",
      });

    expect(res.status).toBe(201);
    expect(createSpy).toHaveBeenCalledTimes(1);

    const storedData = createSpy.mock.calls[0][0] as any;
    expect(storedData.data.name).toBe("Rizky Nur'Aini");
    expect(storedData.data.contact).toBe("6281377712345");
    expect(storedData.data.email).toBe("rizky@example.com");
  });
});
