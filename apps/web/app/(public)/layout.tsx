import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
import { SiteSettingsProvider } from "@/components/layout/SiteSettingsContext";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteSettings } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

async function getInitialSettings(): Promise<SiteSettings | null> {
  try {
    const res = await fetch(`${API_BASE}/public/settings`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getInitialSettings();

  return (
    <SiteSettingsProvider initialSettings={settings}>
      <div className="min-h-screen flex flex-col bg-white text-brand-950">
        <JsonLd settings={settings} />
        <TopBar />
        <Navbar />
        <main className="flex-1">{children}</main>
        <WhatsAppFloating />
        <Footer />
      </div>
    </SiteSettingsProvider>
  );
}
