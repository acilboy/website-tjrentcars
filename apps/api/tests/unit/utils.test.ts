import { describe, it, expect } from "vitest";
import { normalizePhoneNumber } from "../../src/utils/phone.js";
import { generateBookingCode } from "../../src/utils/booking-code.js";
import { isDateOverlap } from "../../src/utils/overlap.js";
import { calculateDurationUnits, calculatePriceAndBreakdown } from "../../src/utils/pricing.js";
import { BillingUnit } from "@prisma/client";

describe("Utility: normalizePhoneNumber", () => {
  it("normalizes standard Indonesian local format 08123456789 to 628123456789", () => {
    expect(normalizePhoneNumber("08123456789")).toBe("628123456789");
  });

  it("normalizes international +628123456789 to 628123456789", () => {
    expect(normalizePhoneNumber("+628123456789")).toBe("628123456789");
  });

  it("removes dashes, spaces, and brackets cleanly", () => {
    expect(normalizePhoneNumber("0812-3456-7890")).toBe("6281234567890");
    expect(normalizePhoneNumber("+62 (812) 3456 7890")).toBe("6281234567890");
  });
});

describe("Utility: generateBookingCode", () => {
  it("generates a code with TJ- prefix and 8 alphanumeric characters", () => {
    const code = generateBookingCode();
    expect(code).toMatch(/^TJ-[A-Z2-9]{8}$/);
  });

  it("generates unique codes consecutively", () => {
    const code1 = generateBookingCode();
    const code2 = generateBookingCode();
    expect(code1).not.toBe(code2);
  });
});

describe("Utility: isDateOverlap", () => {
  const baseStart = new Date("2026-12-01T09:00:00Z");
  const baseEnd = new Date("2026-12-03T09:00:00Z");

  it("detects exact overlapping interval", () => {
    expect(isDateOverlap(baseStart, baseEnd, baseStart, baseEnd)).toBe(true);
  });

  it("detects partially overlapping interval", () => {
    const overlapStart = new Date("2026-12-02T09:00:00Z");
    const overlapEnd = new Date("2026-12-05T09:00:00Z");
    expect(isDateOverlap(baseStart, baseEnd, overlapStart, overlapEnd)).toBe(true);
  });

  it("returns false for contiguous non-overlapping interval (end matches start)", () => {
    const nextStart = new Date("2026-12-03T09:00:00Z");
    const nextEnd = new Date("2026-12-05T09:00:00Z");
    expect(isDateOverlap(baseStart, baseEnd, nextStart, nextEnd)).toBe(false);
  });

  it("returns false for completely separate interval", () => {
    const separateStart = new Date("2026-12-10T09:00:00Z");
    const separateEnd = new Date("2026-12-12T09:00:00Z");
    expect(isDateOverlap(baseStart, baseEnd, separateStart, separateEnd)).toBe(false);
  });
});

describe("Utility: Pricing & Duration calculation", () => {
  const pickup = new Date("2026-12-01T09:00:00Z");

  it("calculates 1 day for 24 hours under DAILY billing", () => {
    const returnAt = new Date("2026-12-02T09:00:00Z");
    const result = calculateDurationUnits(pickup, returnAt, BillingUnit.DAILY);
    expect(result.durationDays).toBe(1);
    expect(result.durationUnits).toBe(1);
  });

  it("rounds up duration with ceil for partial day (28 hours = 2 days)", () => {
    const returnAt = new Date("2026-12-02T13:00:00Z"); // 28 hours
    const result = calculateDurationUnits(pickup, returnAt, BillingUnit.DAILY);
    expect(result.durationDays).toBe(2);
    expect(result.durationUnits).toBe(2);
  });

  it("calculates 1 week for 7 days under WEEKLY billing", () => {
    const returnAt = new Date("2026-12-08T09:00:00Z"); // 7 days
    const result = calculateDurationUnits(pickup, returnAt, BillingUnit.WEEKLY);
    expect(result.durationDays).toBe(7);
    expect(result.durationUnits).toBe(1);
  });

  it("rounds up to 2 weeks for 8 days under WEEKLY billing", () => {
    const returnAt = new Date("2026-12-09T09:00:00Z"); // 8 days
    const result = calculateDurationUnits(pickup, returnAt, BillingUnit.WEEKLY);
    expect(result.durationDays).toBe(8);
    expect(result.durationUnits).toBe(2);
  });

  it("calculates estimated total correctly from rate", () => {
    const returnAt = new Date("2026-12-03T09:00:00Z"); // 2 days
    const rateAmount = 500000;
    const calc = calculatePriceAndBreakdown(
      pickup,
      returnAt,
      "WITH_DRIVER",
      BillingUnit.DAILY,
      rateAmount
    );
    expect(calc.durationUnits).toBe(2);
    expect(calc.estimatedTotal).toBe(1000000);
    expect(calc.quotationRequired).toBe(false);
  });

  it("flags quotationRequired = true when rate is null", () => {
    const returnAt = new Date("2026-12-03T09:00:00Z");
    const calc = calculatePriceAndBreakdown(
      pickup,
      returnAt,
      "WITH_DRIVER",
      BillingUnit.DAILY,
      null
    );
    expect(calc.estimatedTotal).toBeNull();
    expect(calc.quotationRequired).toBe(true);
  });
});
