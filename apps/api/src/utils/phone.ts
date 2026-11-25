import { parsePhoneNumberFromString } from "libphonenumber-js/max";

export function normalizePhoneNumber(raw: string): string {
  // Removes spaces, dashes, parentheses
  const cleaned = raw.replace(/[\s\-\(\)\.]/g, "");

  if (cleaned.startsWith("+62")) {
    return cleaned.substring(1); // 628...
  }
  if (cleaned.startsWith("62")) {
    return cleaned;
  }
  if (cleaned.startsWith("0")) {
    return `62${cleaned.substring(1)}`;
  }
  return cleaned;
}

/**
 * Detects obviously fake number patterns (all identical digits or a full
 * ascending/descending run) so dummy input such as 081234567890 or
 * 080000000000 is rejected. Only the subscriber part (after the leading
 * mobile "8") is inspected so real numbers are not affected.
 */
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

/**
 * Validates a WhatsApp/phone number using libphonenumber metadata with
 * Indonesia as the default country. Accepts 08..., 62..., and +62... input.
 * This checks FORMAT validity only - it does not prove the number is active
 * or owned by the customer.
 */
export function isValidWhatsAppNumber(raw: string): boolean {
  if (typeof raw !== "string") return false;

  const value = raw.trim();
  if (!value || value.length > 20) return false;
  if (/[A-Za-z]/.test(value)) return false;
  if (!/^[\d\s+().-]+$/.test(value)) return false;

  const parsed = parsePhoneNumberFromString(value, "ID");
  if (!parsed || !parsed.isValid()) return false;

  const national = parsed.nationalNumber;

  if (parsed.country === "ID") {
    // WhatsApp requires a mobile number, Indonesian mobiles start with 8.
    if (!national.startsWith("8")) return false;
    if (national.length < 9 || national.length > 12) return false;
  }

  return !isDummyNationalNumber(national);
}
