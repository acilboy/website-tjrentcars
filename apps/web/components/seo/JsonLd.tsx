import { SiteSettings, Article } from "@/types";
import { getAssetUrl } from "@/lib/asset-url";

interface JsonLdProps {
  settings?: SiteSettings | null;
  breadcrumbs?: { name: string; item: string }[];
  article?: Article | null;
}

export function JsonLd({ settings, breadcrumbs, article }: JsonLdProps) {
  const schemas: any[] = [];

  const siteUrl = settings?.siteUrl || "http://localhost:3000";
  const businessName = settings?.businessName || "TJ Rentcar";

  // 1. AutoRental / LocalBusiness Schema
  if (settings) {
    const autoRentalSchema: any = {
      "@context": "https://schema.org",
      "@type": "AutoRental",
      name: businessName,
      url: siteUrl,
      description: settings.metaDescription || "Layanan rental mobil di Jakarta dengan sopir dan lepas kunci.",
    };

    if (settings.phoneNumber || settings.whatsappNumber) {
      autoRentalSchema.telephone = settings.phoneNumber || settings.whatsappNumber;
    }

    if (settings.email) {
      autoRentalSchema.email = settings.email;
    }

    if (settings.serviceAreas && settings.serviceAreas.length > 0) {
      autoRentalSchema.areaServed = settings.serviceAreas.map((area) => ({
        "@type": "AdministrativeArea",
        name: area,
      }));
    }

    // Only include physical address if confirmed and permitted by owner
    if (settings.showPublicAddress && settings.publicAddress) {
      autoRentalSchema.address = {
        "@type": "PostalAddress",
        streetAddress: settings.publicAddress,
        addressLocality: "Jakarta",
        addressRegion: "DKI Jakarta",
        addressCountry: "ID",
      };
    }

    if (settings.showPublicAddress && settings.publicCoordinates) {
      autoRentalSchema.geo = {
        "@type": "GeoCoordinates",
        latitude: settings.publicCoordinates.lat,
        longitude: settings.publicCoordinates.lng,
      };
    }

    schemas.push(autoRentalSchema);

    // 2. WebSite Schema
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: businessName,
      url: siteUrl,
    });
  }

  // 3. BreadcrumbList Schema
  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((b, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: b.name,
        item: b.item.startsWith("http") ? b.item : `${siteUrl}${b.item}`,
      })),
    });
  }

  // 4. Article Schema
  if (article) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.excerpt || article.metaDescription,
      image: article.featuredImageUrl ? getAssetUrl(article.featuredImageUrl) : undefined,
      author: {
        "@type": "Person",
        name: article.authorName || "TJ Rentcar Editorial",
      },
      publisher: {
        "@type": "Organization",
        name: businessName,
        url: siteUrl,
      },
      datePublished: article.publishedAt,
      dateModified: article.updatedAt || article.publishedAt,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${siteUrl}${article.canonicalPath || `/artikel/${article.slug}`}`,
      },
    });
  }

  return (
    <>
      {schemas.map((s, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
    </>
  );
}
