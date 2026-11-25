export const PERSON_NAME_MIN = 3;
export const PERSON_NAME_MAX = 80;
export const LOCATION_MIN = 3;
export const LOCATION_MAX = 200;
export const NOTE_MAX = 1000;
export const MESSAGE_MIN = 5;
export const MESSAGE_MAX = 2000;
export const EMAIL_MAX = 254;

/** Trims and collapses repeated whitespace into a single space. */
export function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

const NAME_ALLOWED_CHARS = /^[\p{L}\p{M}\s.'\u2019-]+$/u;

/**
 * Returns an Indonesian error message for an invalid person name, or null.
 * The value must already be normalized with collapseWhitespace().
 */
export function getPersonNameError(normalized: string): string | null {
  if (!normalized) return "Nama lengkap wajib diisi.";
  if (normalized.length < PERSON_NAME_MIN) {
    return `Nama lengkap minimal ${PERSON_NAME_MIN} karakter.`;
  }
  if (normalized.length > PERSON_NAME_MAX) {
    return `Nama lengkap maksimal ${PERSON_NAME_MAX} karakter.`;
  }
  if (/\d/.test(normalized)) {
    return "Nama lengkap tidak boleh berisi angka.";
  }
  if (!NAME_ALLOWED_CHARS.test(normalized)) {
    return "Nama lengkap hanya boleh berisi huruf, spasi, titik, tanda hubung, atau apostrof.";
  }
  const letterCount = (normalized.match(/\p{L}/gu) || []).length;
  if (letterCount < 2) {
    return "Nama lengkap minimal 2 huruf.";
  }
  if (!/^[\p{L}\p{M}]/u.test(normalized)) {
    return "Nama lengkap harus diawali huruf.";
  }
  if (!/[\p{L}\p{M}]$/u.test(normalized)) {
    return "Nama lengkap harus diakhiri huruf.";
  }
  return null;
}

/**
 * Trims and lowercases an email. Empty strings become null so an untouched
 * optional email field is stored as NULL instead of an invalid value.
 */
export function normalizeEmail(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim().toLowerCase();
  return trimmed === "" ? null : trimmed;
}

export function getEmailError(email: string | null): string | null {
  if (email === null) return null;
  if (email.length > EMAIL_MAX) return `Email maksimal ${EMAIL_MAX} karakter.`;
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  return valid ? null : "Format email tidak valid.";
}

/** Returns an error message for required free text, or null. */
export function getRequiredTextError(
  value: string,
  label: string,
  min: number,
  max: number
): string | null {
  if (!value) return `${label} wajib diisi.`;
  if (value.length < min) return `${label} minimal ${min} karakter.`;
  if (value.length > max) return `${label} maksimal ${max} karakter.`;
  return null;
}

/** Returns an error message for optional free text, or null. */
export function getOptionalTextError(
  value: string,
  label: string,
  max: number
): string | null {
  if (value.length > max) return `${label} maksimal ${max} karakter.`;
  return null;
}
