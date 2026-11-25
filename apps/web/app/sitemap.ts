import { MetadataRoute } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/mobil`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/layanan`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/layanan/dengan-sopir`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/layanan/lepas-kunci`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/layanan/sewa-harian`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/layanan/sewa-mingguan`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/layanan/sewa-bulanan`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/layanan/antar-jemput-bandara`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/layanan/perjalanan-luar-kota`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/tentang-kami`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/syarat-ketentuan`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/kebijakan-privasi`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/kontak`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/artikel`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  // Fetch active vehicles
  try {
    const res = await fetch(`${API_BASE}/public/vehicles?limit=100`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = await res.json();
      const vehicles = json.data || [];
      for (const v of vehicles) {
        if (v.robotsIndex !== false) {
          routes.push({
            url: `${SITE_URL}/mobil/${v.slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
          });
        }
      }
    }
  } catch {}

  // Fetch published articles
  try {
    const res = await fetch(`${API_BASE}/public/articles?limit=100`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = await res.json();
      const articles = json.data || [];
      for (const a of articles) {
        routes.push({
          url: `${SITE_URL}/artikel/${a.slug}`,
          lastModified: a.publishedAt ? new Date(a.publishedAt) : new Date(),
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }
  } catch {}

  return routes;
}
