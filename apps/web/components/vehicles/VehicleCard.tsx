import Link from "next/link";
import { Users, Fuel, Gauge, ArrowRight, Car } from "lucide-react";
import { Vehicle } from "@/types";
import { formatRupiah } from "@/lib/formatters";
import { getAssetUrl } from "@/lib/asset-url";

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const rawPhotoUrl =
    vehicle.primaryImage?.url ||
    (vehicle.images && vehicle.images[0]?.url) ||
    "";
  const photoUrl = getAssetUrl(rawPhotoUrl);

  const altText =
    vehicle.primaryImage?.altText ||
    `Unit armada ${vehicle.name} TJ Rentcar Jakarta`;

  return (
    <article className="bg-white rounded-2xl border border-brand-200 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col group">
      {/* Photo Container */}
      <div className="relative aspect-[16/10] bg-brand-50 overflow-hidden border-b border-brand-100">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={altText}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-brand-50 text-brand-400 px-4 text-center">
            <Car className="w-10 h-10 text-gold-600/70 mb-2" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-500">
              Foto Unit Segera Diperbarui
            </span>
          </div>
        )}

        <div className="absolute top-3 left-3 bg-brand-950/90 text-gold-300 border border-gold-500/30 text-[11px] font-semibold px-2.5 py-1 rounded-lg uppercase tracking-wider">
          {vehicle.category}
        </div>
        {vehicle.year && (
          <div className="absolute top-3 right-3 bg-white/95 text-brand-950 border border-brand-200 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm tabular-nums">
            {vehicle.year}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-bold text-gold-700 uppercase tracking-widest mb-1">
            {vehicle.brand}
          </div>
          <h3 className="text-lg font-bold text-brand-950 group-hover:text-gold-700 transition-colors leading-snug">
            <Link href={`/mobil/${vehicle.slug}`}>{vehicle.name}</Link>
          </h3>

          {/* Quick Specs */}
          <div className="grid grid-cols-3 gap-2 py-3 my-3.5 border-y border-brand-100 text-xs text-brand-600 tabular-nums">
            <div className="flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span className="truncate">{vehicle.seats ? `${vehicle.seats} Kursi` : "-"}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Gauge className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span className="truncate">
                {vehicle.transmission === "AUTOMATIC"
                  ? "Matic"
                  : vehicle.transmission === "MANUAL"
                  ? "Manual"
                  : "-"}
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Fuel className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span className="truncate">{vehicle.fuelType || "Bensin"}</span>
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-1 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[11px] text-brand-500 block font-medium">
              Mulai dari
            </span>
            <div className="text-base font-extrabold text-brand-950 tabular-nums truncate">
              {vehicle.minRate ? formatRupiah(vehicle.minRate) : "Hubungi Kami"}
              {vehicle.minRate ? (
                <span className="text-xs font-normal text-brand-500"> /hari</span>
              ) : null}
            </div>
          </div>

          <div className="flex space-x-2 shrink-0">
            <Link
              href={`/mobil/${vehicle.slug}`}
              className="inline-flex items-center justify-center px-3 py-2 rounded-xl border border-brand-200 text-brand-700 hover:text-brand-950 hover:border-brand-400 hover:bg-brand-50 transition-colors text-xs font-semibold"
              title="Lihat spesifikasi dan foto lengkap"
            >
              <span>Detail</span>
            </Link>
            <Link
              href={`/booking?vehicleId=${vehicle.id}`}
              className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl bg-brand-950 hover:bg-brand-800 text-white text-xs font-bold transition-colors shadow-sm"
            >
              <span>Sewa</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 text-gold-400" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
