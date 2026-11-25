import { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ShieldCheck, HeartHandshake, Car } from "lucide-react";

export const metadata: Metadata = {
  title: "Tentang TJ Rentcar | Rental Mobil Jakarta",
  description:
    "Kenali TJ Rentcar, layanan rental mobil yang beroperasi di Jakarta. Pelajari informasi usaha, layanan, dan cara menghubungi tim kami.",
  alternates: {
    canonical: "/tentang-kami",
  },
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

async function getPageData() {
  try {
    const res = await fetch(`${API_BASE}/public/pages/tentang-kami`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export default async function AboutPage() {
  const page = await getPageData();

  const breadcrumbs = [{ name: "Tentang Kami", item: "/tentang-kami" }];

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-brand-100 pb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-gold-700 uppercase tracking-widest mb-2">
              <span className="w-6 h-0.5 bg-gold-500 inline-block" />
              <span>Profil Perusahaan</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-950 tracking-tight">
              Tentang TJ Rentcar
            </h1>
            <p className="text-sm sm:text-base text-brand-600 mt-3 leading-relaxed">
              Mitra transportasi rental mobil terpercaya di wilayah Jakarta, menyediakan armada terawat dan pengemudi profesional untuk kenyamanan mobilitas Anda.
            </p>
          </div>
          <BrandLogo surface="light" size="lg" />
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-2xl border border-brand-200 p-7 sm:p-11 shadow-sm space-y-8">
          <div className="prose max-w-none text-brand-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {page?.content ||
              `### Profil Perusahaan
TJ Rentcar adalah penyedia jasa rental mobil terpercaya yang beroperasi di wilayah Jakarta. Kami berkomitmen memberikan layanan transportasi yang aman, nyaman, dan tepat waktu untuk berbagai kebutuhan masyarakat, mulai dari urusan personal, wisata keluarga, hingga keperluan korporasi.

### Visi Kami
Menjadi mitra transportasi rental mobil pilihan utama di Jakarta yang dikenal atas keandalan armada, integritas layanan, dan transparansi tarif.

### Nilai Layanan
- **Unit Terawat:** Setiap kendaraan selalu diperiksa secara berkala sebelum diserahkan kepada pelanggan.
- **Transparansi:** Tarif jelas tanpa biaya tersembunyi yang membingungkan.
- **Sopir Profesional:** Berpengalaman, ramah, dan menguasai navigasi Jakarta dan sekitarnya.
- **Responsif:** Tim admin yang siap membantu reservasi dan kebutuhan perjalanan Anda.`}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 border-t border-brand-100">
            <div className="flex items-start space-x-3 p-4 rounded-xl bg-brand-50/60 border border-brand-100">
              <div className="w-10 h-10 rounded-xl bg-brand-950 text-gold-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-brand-950">Legalitas &amp; Aman</h3>
                <p className="text-xs text-brand-600 mt-1">
                  Seluruh unit memiliki surat-surat kendaraan yang sah dan lengkap.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-xl bg-brand-50/60 border border-brand-100">
              <div className="w-10 h-10 rounded-xl bg-brand-950 text-gold-400 flex items-center justify-center shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-brand-950">Unit Bersih &amp; Prima</h3>
                <p className="text-xs text-brand-600 mt-1">
                  Kondisi kabin bersih dan mesin terawat secara berkala.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-xl bg-brand-50/60 border border-brand-100">
              <div className="w-10 h-10 rounded-xl bg-brand-950 text-gold-400 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-brand-950">Pelayanan Ramah</h3>
                <p className="text-xs text-brand-600 mt-1">
                  Sopir beretika sopan serta admin yang sigap melayani reservasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
