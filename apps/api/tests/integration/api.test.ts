import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { prisma } from "../../src/lib/prisma.js";

describe("Integration: Public Endpoints", () => {
  it("GET /health returns 200 and status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("GET /api/v1/docs returns OpenAPI specification", async () => {
    const res = await request(app).get("/api/v1/docs");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.0.3");
    expect(res.body.info.title).toContain("TJ Rentcar");
  });

  it("GET /api/v1/public/settings returns safe public configuration", async () => {
    const res = await request(app).get("/api/v1/public/settings");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.businessName).toBe("TJ Rentcar");
    expect(res.body.data.city).toBe("Jakarta");
    // Privacy check: secret keys must not be present
    expect(res.body.data.SESSION_SECRET).toBeUndefined();
    expect(res.body.data.DATABASE_URL).toBeUndefined();
  });

  it("POST /api/v1/public/bookings validates required fields and schedule", async () => {
    // Missing vehicleId and schedule
    const res = await request(app)
      .post("/api/v1/public/bookings")
      .send({
        customerName: "Budi",
        customerPhone: "0812345678",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("POST /api/v1/public/contact validates message length and inputs", async () => {
    const res = await request(app)
      .post("/api/v1/public/contact")
      .send({
        name: "A", // too short
        contact: "123", // too short
        message: "Hi", // too short
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("Integration: Admin Auth Protection", () => {
  it("GET /api/v1/admin/dashboard rejects unauthenticated requests with 401", async () => {
    const res = await request(app).get("/api/v1/admin/dashboard");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("POST /api/v1/admin/auth/login rejects wrong credentials with 401", async () => {
    vi.spyOn(prisma.adminUser, "findUnique").mockResolvedValueOnce(null);
    vi.spyOn(prisma.auditLog, "create").mockResolvedValueOnce({} as any);

    const res = await request(app)
      .post("/api/v1/admin/auth/login")
      .send({
        email: "wrong@tjrentcar.com",
        password: "IncorrectPassword123!",
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });
});
