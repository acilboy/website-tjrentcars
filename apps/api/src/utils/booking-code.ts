import crypto from "crypto";

export function generateBookingCode(): string {
  // Generates e.g. TJ-7K4P9X2Q
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Omits O, 0, I, 1 for clarity
  let randomPart = "";
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    randomPart += chars[bytes[i] % chars.length];
  }
  return `TJ-${randomPart}`;
}
