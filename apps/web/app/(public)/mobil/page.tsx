import { Suspense } from "react";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { VehicleListClient } from "./VehicleListClient";
import { Vehicle } from "@/types";

export const metadata: Metadata = {
  title: "Daftar Mobil dan Harga Rental Jakarta | TJ Rentcar",
  description:
    "Lihat pilihan armada TJ Rentcar untuk kebutuhan perjalanan di Jakarta. Bandingkan spesifikasi, pilihan layanan, dan tarif yang tersedia.",
  alternates: {
    canonical: "/mobil",
  },
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

async function getInitialVehicles(): Promise<Vehicle[]> {
  try {
    const res = await fetch(`${API_BASE}/public/vehicles?limit=50`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function MobilCatalogPage() {
  const initialVehicles = await getInitialVehicles();

  const breadcrumbs = [{ name: "Pilihan Mobil", item: "/mobil" }];

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="mb-8 border-b border-brand-100 pb-6">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-gold-700 uppercase tracking-widest mb-2">
            <span className="w-6 h-0.5 bg-gold-500 inline-block" />
            <span>Katalog Sewa Mobil Jakarta</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-950 tracking-tight">
            Pilihan Mobil Rental TJ Rentcar di Jakarta
          </h1>
          <p className="text-sm text-brand-600 mt-2.5 max-w-3xl leading-relaxed">
            Bandingkan beragam kategori kendaraan dari MPV hemat, Medium MPV nyaman, hingga SUV tangguh. Seluruh unit terawat prima dan siap melayani rute Jakarta maupun perjalanan luar kota.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="py-12 text-center text-sm text-brand-500">
              Memuat katalog armada...
            </div>
          }
        >
          <VehicleListClient initialVehicles={initialVehicles} />
        </Suspense>
      </div>
    </div>
  );
}
