import { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan Rental Mobil | TJ Rentcar",
  description:
    "Ketahui syarat dan ketentuan sewa mobil lepas kunci dan dengan sopir di TJ Rentcar Jakarta. Transparan, aman, dan mudah dipahami.",
  alternates: {
    canonical: "/syarat-ketentuan",
  },
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

async function getPageData() {
  try {
    const res = await fetch(`${API_BASE}/public/pages/syarat-ketentuan`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export default async function TermsPage() {
  const page = await getPageData();

  const breadcrumbs = [
    { name: "Syarat & Ketentuan", item: "/syarat-ketentuan" },
  ];

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 border-b border-brand-100 pb-6">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-gold-700 uppercase tracking-widest mb-2">
            <span className="w-6 h-0.5 bg-gold-500 inline-block" />
            <span>Ketentuan Layanan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-950 tracking-tight">
            Syarat & Ketentuan Rental
          </h1>
          <p className="text-xs sm:text-sm text-brand-600 mt-2">
            Harap membaca syarat dan ketentuan berikut sebelum melakukan reservasi kendaraan di TJ Rentcar Jakarta.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-brand-200 p-7 sm:p-10 shadow-sm">
          <div className="prose max-w-none text-brand-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {page?.content || `
### Ketentuan Umum
1. Seluruh pemesanan melalui website berstatus permintaan reservasi (Pending) dan baru sah setelah dikonfirmasi oleh Admin TJ Rentcar.
2. Penggunaan kendaraan hanya berlaku untuk wilayah yang telah disepakati saat pemesanan.

### Persyaratan Rental Lepas Kunci
1. Menunjukkan KTP asli dan SIM A yang masih berlaku.
2. Bersedia melalui proses verifikasi data domisili dan dokumen identitas.
3. Menyerahkan jaminan atau deposit sesuai kesepakatan yang akan dikembalikan saat rental berakhir tanpa kendala.
4. Penggunaan kendaraan harus mematuhi peraturan lalu lintas yang berlaku di Indonesia.

### Ketentuan Rental dengan Sopir
1. Durasi harian dihitung per 12 jam atau per tanggal kalender sesuai paket yang diambil.
2. Penggunaan melebihi batas durasi (overtime) akan dikenakan biaya tambahan per jam sesuai ketentuan armada.
3. Biaya tol, parkir, bahan bakar (BBM), dan uang makan sopir disesuaikan dengan paket yang dipilih.
4. Untuk perjalanan ke luar kota yang menginap, akomodasi sopir ditanggung oleh penyewa atau diganti dengan uang inap.
            `}
          </div>
        </div>
      </div>
    </div>
  );
}
