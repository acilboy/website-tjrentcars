/**
 * Convert backend asset paths (for example /uploads/photo.webp) into absolute
 * URLs served by the API host. Absolute external URLs remain unchanged.
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";
const SITE_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function getAssetUrl(value: string | null | undefined): string {
  if (!value) return "";

  const raw = value.trim();
  if (!raw) return "";

  // Preserve absolute URLs, protocol-relative URLs, and browser-created URLs.
  if (/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(raw) || /^(?:data|blob):/i.test(raw)) {
    return raw;
  }

  try {
    const apiUrl = new URL(API_BASE_URL, SITE_BASE_URL);
    const assetPath = raw.startsWith("/") ? raw : `/${raw}`;
    return new URL(assetPath, apiUrl.origin).toString();
  } catch {
    // Keep the original value as a safe fallback if the environment URL is invalid.
    return raw;
  }
}
