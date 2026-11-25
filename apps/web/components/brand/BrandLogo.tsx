import { getAssetUrl } from "@/lib/asset-url";

export const OFFICIAL_LOGO_PATH = "/brand/tj-rentcar-logo.jpeg";

interface BrandLogoProps {
  logoUrl?: string | null;
  alt?: string;
  surface?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

/**
 * Displays the official TJ Rentcar logo preserving its natural 1078x1052 ratio
 * without cropping, stretching, or tinting. Uses a clean light container when
 * placed on dark surfaces so black linework and typography stay legible.
 */
export function BrandLogo({
  logoUrl,
  alt = "TJ Rentcar - PT. TJB Nusantara Rental Car",
  surface = "light",
  size = "md",
}: BrandLogoProps) {
  const src = logoUrl ? getAssetUrl(logoUrl) : OFFICIAL_LOGO_PATH;

  const sizeClass =
    size === "sm"
      ? "h-10 w-auto"
      : size === "lg"
      ? "h-16 w-auto"
      : "h-12 sm:h-14 w-auto";

  if (surface === "dark") {
    return (
      <span className="inline-flex items-center justify-center rounded-xl bg-white p-1.5 border border-white/15 shrink-0">
        <img
          src={src}
          alt={alt}
          width={1078}
          height={1052}
          className={`${sizeClass} object-contain`}
        />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center justify-center rounded-lg bg-white shrink-0">
      <img
        src={src}
        alt={alt}
        width={1078}
        height={1052}
        className={`${sizeClass} object-contain`}
      />
    </span>
  );
}
