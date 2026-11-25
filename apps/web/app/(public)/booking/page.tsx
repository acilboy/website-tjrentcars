import { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { BookingFormClient } from "./BookingFormClient";
import { Vehicle } from "@/types";

export const metadata: Metadata = {
  title: "Formulir Booking Rental Mobil | TJ Rentcar Jakarta",
  description:
    "Formulir pengajuan pemesanan rental mobil online TJ Rentcar di Jakarta. Pilih kendaraan, tentukan jadwal penjemputan, dan kirim permintaan booking dengan mudah.",
  robots: {
    index: false,
    follow: true,
  },
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

async function getActiveVehicles(): Promise<Vehicle[]> {
  try {
    const res = await fetch(`${API_BASE}/public/vehicles?limit=50`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function BookingPage({
  searchParams,
}: {
  searchParams: { vehicleId?: string; pickupAt?: string; returnAt?: string; serviceType?: string; billingUnit?: string };
}) {
  const vehicles = await getActiveVehicles();

  const breadcrumbs = [{ name: "Pemesanan", item: "/booking" }];

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="mb-8 border-b border-brand-100 pb-6">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-gold-700 uppercase tracking-widest mb-2">
            <span className="w-6 h-0.5 bg-gold-500 inline-block" />
            <span>Reservasi Online</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-brand-950 tracking-tight">
            Formulir Pemesanan Rental Mobil
          </h1>
          <p className="text-xs sm:text-sm text-brand-600 mt-2.5 leading-relaxed">
            Lengkapi detail jadwal dan informasi penjemputan Anda di bawah ini. Permintaan booking Anda akan masuk ke sistem kami dengan status{" "}
            <strong className="text-brand-950">Pending</strong> dan segera dikonfirmasi oleh tim admin TJ Rentcar.
          </p>
        </div>

        <BookingFormClient
          vehicles={vehicles}
          initialVehicleId={searchParams.vehicleId}
          initialPickupAt={searchParams.pickupAt}
          initialReturnAt={searchParams.returnAt}
          initialServiceType={searchParams.serviceType}
          initialBillingUnit={searchParams.billingUnit}
        />
      </div>
    </div>
  );
}
