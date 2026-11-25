import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Fuel,
  Gauge,
  Briefcase,
  DoorClosed,
  CheckCircle2,
  Calendar,
  Shield,
  Car,
  ArrowRight,
} from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { AvailabilityChecker } from "@/components/vehicles/AvailabilityChecker";
import { Vehicle } from "@/types";
import { formatRupiah } from "@/lib/formatters";
import { getAssetUrl } from "@/lib/asset-url";

interface Props {
  params: { slug: string };
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

async function getVehicle(slug: string): Promise<Vehicle | null> {
  try {
    const res = await fetch(`${API_BASE}/public/vehicles/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vehicle = await getVehicle(params.slug);
  if (!vehicle) {
    return { title: "Mobil Tidak Ditemukan | TJ Rentcar" };
  }

  const title = vehicle.metaTitle || `${vehicle.name} Jakarta | Harga dan Spesifikasi - TJ Rentcar`;
  const description =
    vehicle.metaDescription ||
    `Sewa mobil ${vehicle.name} di Jakarta. Cek tarif harian, mingguan, bulanan, ketersediaan unit, dan ajukan pemesanan di TJ Rentcar.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/mobil/${vehicle.slug}`,
    },
    openGraph: {
      title,
      description,
      images: vehicle.ogImageUrl ? [{ url: getAssetUrl(vehicle.ogImageUrl) }] : undefined,
    },
  };
}

export default async function VehicleDetailPage({ params }: Props) {
  const vehicle = await getVehicle(params.slug);

  if (!vehicle) {
    notFound();
  }

  const breadcrumbs = [
    { name: "Pilihan Mobil", item: "/mobil" },
    { name: vehicle.name, item: `/mobil/${vehicle.slug}` },
  ];

  const rawPrimaryPhoto = vehicle.primaryImage?.url || vehicle.images?.[0]?.url;
  const primaryPhoto = getAssetUrl(rawPrimaryPhoto);

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Column */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <div className="text-xs font-bold text-gold-700 uppercase tracking-widest mb-1.5">
                {vehicle.brand} • {vehicle.category}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-950 tracking-tight">
                {vehicle.name}
              </h1>
            </div>

            {/* Main Photo */}
            <div className="rounded-2xl overflow-hidden border border-brand-200 bg-brand-50 aspect-[16/10] shadow-sm relative">
              {primaryPhoto ? (
                <img
                  src={primaryPhoto}
                  alt={vehicle.primaryImage?.altText || `Tampak armada ${vehicle.name} TJ Rentcar`}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-brand-500 px-6 text-center">
                  <Car className="w-12 h-12 text-gold-600/70 mb-2.5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Foto Unit Segera Diperbarui Admin
                  </span>
                </div>
              )}
            </div>

            {/* Additional Photo Gallery */}
            {vehicle.images && vehicle.images.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {vehicle.images.map((img) => (
                  <div
                    key={img.id}
                    className="rounded-xl overflow-hidden border border-brand-200 aspect-[4/3] bg-brand-50"
                  >
                    <img
                      src={getAssetUrl(img.url)}
                      alt={img.altText || vehicle.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Specifications Grid */}
            <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6">
              <h2 className="text-base font-bold text-brand-950 mb-4">
                Spesifikasi Kendaraan
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs sm:text-sm tabular-nums">
                <div className="flex items-center space-x-2.5">
                  <Users className="w-4 h-4 text-gold-700 shrink-0" />
                  <div>
                    <span className="text-brand-500 text-[11px] block">Kapasitas</span>
                    <span className="font-semibold text-brand-950">
                      {vehicle.seats ? `${vehicle.seats} Penumpang` : "-"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5">
                  <Gauge className="w-4 h-4 text-gold-700 shrink-0" />
                  <div>
                    <span className="text-brand-500 text-[11px] block">Transmisi</span>
                    <span className="font-semibold text-brand-950">
                      {vehicle.transmission === "AUTOMATIC"
                        ? "Otomatis (Matic)"
                        : vehicle.transmission === "MANUAL"
                        ? "Manual"
                        : "-"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5">
                  <Fuel className="w-4 h-4 text-gold-700 shrink-0" />
                  <div>
                    <span className="text-brand-500 text-[11px] block">Bahan Bakar</span>
                    <span className="font-semibold text-brand-950">
                      {vehicle.fuelType || "Bensin"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5">
                  <DoorClosed className="w-4 h-4 text-gold-700 shrink-0" />
                  <div>
                    <span className="text-brand-500 text-[11px] block">Jumlah Pintu</span>
                    <span className="font-semibold text-brand-950">
                      {vehicle.doors ? `${vehicle.doors} Pintu` : "-"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5">
                  <Briefcase className="w-4 h-4 text-gold-700 shrink-0" />
                  <div>
                    <span className="text-brand-500 text-[11px] block">Kapasitas Bagasi</span>
                    <span className="font-semibold text-brand-950">
                      {vehicle.luggageCapacity || "-"}
                    </span>
                  </div>
                </div>

                {vehicle.year && (
                  <div className="flex items-center space-x-2.5">
                    <Calendar className="w-4 h-4 text-gold-700 shrink-0" />
                    <div>
                      <span className="text-brand-500 text-[11px] block">Tahun Armada</span>
                      <span className="font-semibold text-brand-950">{vehicle.year}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div>
                <h2 className="text-base font-bold text-brand-950 mb-3">
                  Fitur &amp; Fasilitas
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {vehicle.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 text-xs sm:text-sm text-brand-800 bg-white border border-brand-200 px-3 py-2 rounded-xl"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {vehicle.description && (
              <div>
                <h2 className="text-base font-bold text-brand-950 mb-2">
                  Deskripsi Unit
                </h2>
                <p className="text-sm text-brand-600 leading-relaxed whitespace-pre-line">
                  {vehicle.description}
                </p>
              </div>
            )}

            {/* Rates Table */}
            {vehicle.rates && vehicle.rates.length > 0 && (
              <div>
                <h2 className="text-base font-bold text-brand-950 mb-3">
                  Daftar Tarif Sewa Resmi
                </h2>
                <div className="overflow-x-auto rounded-2xl border border-brand-200 shadow-sm">
                  <table className="w-full text-left text-xs sm:text-sm tabular-nums">
                    <thead className="bg-brand-950 text-white font-semibold">
                      <tr>
                        <th className="p-3.5">Pilihan Layanan</th>
                        <th className="p-3.5">Durasi</th>
                        <th className="p-3.5">Tarif (IDR)</th>
                        <th className="p-3.5">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-100 bg-white">
                      {vehicle.rates.map((rate) => (
                        <tr key={rate.id} className="hover:bg-brand-50/70">
                          <td className="p-3.5 font-semibold text-brand-950">
                            {rate.serviceType === "WITH_DRIVER" ? "Dengan Sopir" : "Lepas Kunci"}
                          </td>
                          <td className="p-3.5 text-brand-600">
                            {rate.billingUnit === "DAILY"
                              ? "Harian (24 Jam)"
                              : rate.billingUnit === "WEEKLY"
                              ? "Mingguan (7 Hari)"
                              : "Bulanan (30 Hari)"}
                          </td>
                          <td className="p-3.5 font-extrabold text-brand-950">
                            {formatRupiah(rate.amount)}
                          </td>
                          <td className="p-3.5 text-brand-500 text-xs">
                            {rate.notes || "Sesuai ketentuan"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="lg:sticky lg:top-24 space-y-5">
              <AvailabilityChecker vehicleId={vehicle.id} vehicleName={vehicle.name} />

              <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5 text-xs text-brand-800 space-y-3">
                <div className="flex items-center space-x-2 font-bold text-sm text-brand-950">
                  <Shield className="w-4 h-4 text-gold-600" />
                  <span>Jaminan Layanan TJ Rentcar</span>
                </div>
                <ul className="space-y-1.5 list-disc list-inside text-brand-600">
                  <li>Booking baru diproses dengan status Pending sampai dikonfirmasi admin.</li>
                  <li>Layanan lepas kunci mewajibkan verifikasi KTP dan SIM yang masih berlaku.</li>
                  <li>Kebersihan dan kenyamanan kabin diperiksa sebelum serah terima unit.</li>
                </ul>
                <div className="pt-1">
                  <Link
                    href={`/booking?vehicleId=${vehicle.id}`}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-brand-950 hover:text-gold-700 transition-colors"
                  >
                    <span>Langsung ke Formulir Booking</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gold-600" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
