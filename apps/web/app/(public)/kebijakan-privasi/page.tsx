import { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | TJ Rentcar Jakarta",
  description:
    "Kebijakan privasi TJ Rentcar Jakarta menjelaskan bagaimana data pribadi Anda dikumpulkan, digunakan, dan dilindungi secara aman.",
  alternates: {
    canonical: "/kebijakan-privasi",
  },
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

async function getPageData() {
  try {
    const res = await fetch(`${API_BASE}/public/pages/kebijakan-privasi`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export default async function PrivacyPolicyPage() {
  const page = await getPageData();

  const breadcrumbs = [
    { name: "Kebijakan Privasi", item: "/kebijakan-privasi" },
  ];

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 border-b border-brand-100 pb-6">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-gold-700 uppercase tracking-widest mb-2">
            <span className="w-6 h-0.5 bg-gold-500 inline-block" />
            <span>Privasi & Perlindungan Data</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-950 tracking-tight">
            Kebijakan Privasi
          </h1>
          <p className="text-xs sm:text-sm text-brand-600 mt-2">
            Komitmen TJ Rentcar dalam menjaga keamanan dan kerahasiaan data pribadi seluruh pelanggan kami.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-brand-200 p-7 sm:p-10 shadow-sm">
          <div className="prose max-w-none text-brand-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {page?.content || `
### Perlindungan Data Pribadi
TJ Rentcar menghargai dan melindungi privasi data pelanggan kami. Informasi yang kami kumpulkan saat Anda mengajukan booking (nama lengkap, nomor telepon/WhatsApp, email, dan alamat penjemputan) hanya digunakan untuk:
1. Memproses dan mengonfirmasi reservasi kendaraan yang Anda pilih.
2. Menghubungi Anda terkait jadwal, penjemputan, dan koordinasi armada.
3. Kebutuhan verifikasi dokumen identitas untuk layanan lepas kunci.

### Penyimpanan dan Keamanan Data
Data pribadi Anda disimpan secara aman dan tidak akan diperjualbelikan kepada pihak ketiga manapun untuk tujuan periklanan atau spam. Kami menerapkan pembatasan akses ketat pada sistem backend kami sehingga hanya admin resmi yang berwenang yang dapat melihat data pemesanan.
            `}
          </div>
        </div>
      </div>
    </div>
  );
}
