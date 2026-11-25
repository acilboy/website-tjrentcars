/**
 * Formatter utilities for TJ Rentcar
 */

export function formatRupiah(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return "Hubungi untuk harga";
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d) + " WIB";
  } catch {
    return isoString;
  }
}

export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return isoString;
  }
}

export function buildWhatsAppLink(
  phoneNumber: string | null | undefined,
  message: string
): string {
  if (!phoneNumber) return "#";
  // Clean phone number (strip spaces, +, dashes)
  let cleanNumber = phoneNumber.replace(/[\s\+\-\(\)]/g, "");
  if (cleanNumber.startsWith("0")) {
    cleanNumber = "62" + cleanNumber.substring(1);
  }
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
