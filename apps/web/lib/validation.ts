import { parsePhoneNumberFromString } from "libphonenumber-js";

/**
 * Client-side mirror of the API validation rules
 * (apps/api/src/schemas/index.ts + apps/api/src/utils/validation.ts).
 * The API remains the authoritative validator: backend errors are mapped
 * back onto the same fields by the forms.
 */

export const PERSON_NAME_MIN = 3;
export const PERSON_NAME_MAX = 80;
export const LOCATION_MIN = 3;
export const LOCATION_MAX = 200;
export const NOTE_MAX = 1000;
export const MESSAGE_MIN = 5;
export const MESSAGE_MAX = 2000;

export const PHONE_HINT =
  "Format yang diterima: 081234567890, 6281234567890, atau +6281234567890.";

export type FieldErrors = Record<string, string>;

export function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

// Built via constructor because the web tsconfig targets ES5, which makes the
// TypeScript checker reject the "u" flag on regex literals. Unicode property
// escapes are still supported by the browsers this app targets.
const NAME_ALLOWED_CHARS = new RegExp("^[\\p{L}\\p{M}\\s.'\\u2019-]+$", "u");
const NAME_LETTERS = new RegExp("\\p{L}", "gu");
const NAME_START_LETTER = new RegExp("^[\\p{L}\\p{M}]", "u");
const NAME_END_LETTER = new RegExp("[\\p{L}\\p{M}]$", "u");

export function normalizePersonName(value: string): string {
  return collapseWhitespace(value);
}

export function validatePersonName(value: string): string | null {
  const normalized = normalizePersonName(value);
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
  const letterCount = (normalized.match(NAME_LETTERS) || []).length;
  if (letterCount < 2) return "Nama lengkap minimal 2 huruf.";
  if (!NAME_START_LETTER.test(normalized)) {
    return "Nama lengkap harus diawali huruf.";
  }
  if (!NAME_END_LETTER.test(normalized)) {
    return "Nama lengkap harus diakhiri huruf.";
  }
  return null;
}

function isDummyNationalNumber(nationalNumber: string): boolean {
  const digits = nationalNumber.startsWith("8")
    ? nationalNumber.substring(1)
    : nationalNumber;

  if (digits.length >= 6 && /^(\d)\1+$/.test(digits)) {
    return true;
  }

  // Reject numbers dominated by a long ascending/descending run, e.g.
  // 081234567890 ("123456789" + "0") or 08987654321.
  const MIN_SEQUENTIAL_RUN = 7;
  let ascending = 1;
  let descending = 1;
  for (let i = 1; i < digits.length; i += 1) {
    const diff = digits.charCodeAt(i) - digits.charCodeAt(i - 1);
    ascending = diff === 1 ? ascending + 1 : 1;
    descending = diff === -1 ? descending + 1 : 1;
    if (ascending >= MIN_SEQUENTIAL_RUN || descending >= MIN_SEQUENTIAL_RUN) {
      return true;
    }
  }

  return false;
}

export function validateWhatsAppNumber(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Nomor WhatsApp wajib diisi.";
  if (trimmed.length > 20) return "Nomor WhatsApp terlalu panjang.";
  if (/[A-Za-z]/.test(trimmed)) {
    return "Nomor WhatsApp tidak boleh berisi huruf.";
  }
  if (!/^[\d\s+().-]+$/.test(trimmed)) {
    return "Nomor WhatsApp hanya boleh berisi angka, spasi, +, -, dan tanda kurung.";
  }

  const parsed = parsePhoneNumberFromString(trimmed, "ID");
  if (!parsed || !parsed.isValid()) {
    return "Nomor WhatsApp tidak valid. Periksa kembali jumlah dan kode nomornya.";
  }

  const national = parsed.nationalNumber;
  if (parsed.country === "ID") {
    if (!national.startsWith("8")) {
      return "Nomor WhatsApp harus berupa nomor seluler (diawali 08).";
    }
    if (national.length < 9 || national.length > 12) {
      return "Nomor WhatsApp tidak valid. Periksa kembali jumlah angkanya.";
    }
  }

  if (isDummyNationalNumber(national)) {
    return "Nomor WhatsApp terlihat tidak valid. Gunakan nomor yang benar-benar aktif.";
  }

  return null;
}

export function normalizeEmailInput(value: string): string {
  return value.trim().toLowerCase();
}

export function validateOptionalEmail(value: string): string | null {
  const normalized = normalizeEmailInput(value);
  if (!normalized) return null;
  if (normalized.length > 254) return "Email maksimal 254 karakter.";
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalized);
  return valid ? null : "Format email tidak valid.";
}

export function validateRequiredText(
  value: string,
  label: string,
  min: number,
  max: number
): string | null {
  const normalized = collapseWhitespace(value);
  if (!normalized) return `${label} wajib diisi.`;
  if (normalized.length < min) return `${label} minimal ${min} karakter.`;
  if (normalized.length > max) return `${label} maksimal ${max} karakter.`;
  return null;
}

export function validateOptionalText(
  value: string,
  label: string,
  max: number
): string | null {
  const normalized = collapseWhitespace(value);
  if (normalized.length > max) return `${label} maksimal ${max} karakter.`;
  return null;
}

/**
 * Converts API `details` ({ field, message }[]) into a field->message map.
 * Unknown fields are ignored so they never break the form.
 */
export function mapApiFieldErrors(
  details: unknown,
  allowedFields: string[]
): FieldErrors {
  const errors: FieldErrors = {};
  if (!Array.isArray(details)) return errors;
  for (const detail of details) {
    if (!detail || typeof detail !== "object") continue;
    const field = (detail as { field?: unknown }).field;
    const message = (detail as { message?: unknown }).message;
    if (typeof field !== "string" || typeof message !== "string") continue;
    if (!allowedFields.includes(field)) continue;
    if (!errors[field]) errors[field] = message;
  }
  return errors;
}
