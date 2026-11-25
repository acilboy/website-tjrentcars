import { BillingUnit } from "@prisma/client";

export interface PricingCalculationResult {
  durationHours: number;
  durationDays: number;
  durationUnits: number;
  unitName: string;
  unitAmount: number | null;
  estimatedTotal: number | null;
  quotationRequired: boolean;
  priceBreakdown: {
    serviceType: string;
    billingUnit: string;
    unitAmount: number | null;
    durationUnits: number;
    unitDays: number;
    estimatedTotal: number | null;
    currency: string;
    calculatedAt: string;
  };
}

export function calculateDurationUnits(
  pickupAt: Date,
  returnAt: Date,
  billingUnit: BillingUnit
): { durationHours: number; durationDays: number; durationUnits: number; unitDays: number } {
  const diffMs = returnAt.getTime() - pickupAt.getTime();
  if (diffMs <= 0) {
    throw new Error("Tanggal kembali harus lebih besar dari tanggal penjemputan.");
  }

  const durationHours = diffMs / (1000 * 60 * 60);
  const durationDays = Math.max(1, Math.ceil(durationHours / 24));

  let durationUnits = 1;
  let unitDays = 1;

  switch (billingUnit) {
    case BillingUnit.DAILY:
      durationUnits = durationDays;
      unitDays = 1;
      break;
    case BillingUnit.WEEKLY:
      unitDays = 7;
      durationUnits = Math.max(1, Math.ceil(durationDays / 7));
      break;
    case BillingUnit.MONTHLY:
      unitDays = 30;
      durationUnits = Math.max(1, Math.ceil(durationDays / 30));
      break;
    default:
      durationUnits = durationDays;
      unitDays = 1;
  }

  return { durationHours, durationDays, durationUnits, unitDays };
}

export function calculatePriceAndBreakdown(
  pickupAt: Date,
  returnAt: Date,
  serviceType: string,
  billingUnit: BillingUnit,
  activeRateAmount: number | null
): PricingCalculationResult {
  const { durationHours, durationDays, durationUnits, unitDays } = calculateDurationUnits(
    pickupAt,
    returnAt,
    billingUnit
  );

  const quotationRequired = activeRateAmount === null || activeRateAmount === undefined;
  const estimatedTotal = quotationRequired ? null : activeRateAmount * durationUnits;

  const unitName =
    billingUnit === BillingUnit.DAILY
      ? "Hari"
      : billingUnit === BillingUnit.WEEKLY
      ? "Minggu"
      : "Bulan";

  const priceBreakdown = {
    serviceType,
    billingUnit,
    unitAmount: activeRateAmount,
    durationUnits,
    unitDays,
    estimatedTotal,
    currency: "IDR",
    calculatedAt: new Date().toISOString(),
  };

  return {
    durationHours,
    durationDays,
    durationUnits,
    unitName,
    unitAmount: activeRateAmount,
    estimatedTotal,
    quotationRequired,
    priceBreakdown,
  };
}
