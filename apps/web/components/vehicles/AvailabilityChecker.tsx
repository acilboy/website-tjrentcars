"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { api, ApiClientError } from "@/lib/api-client";
import { formatRupiah } from "@/lib/formatters";
import { ServiceType, BillingUnit } from "@/types";

interface AvailabilityCheckerProps {
  vehicleId: string;
  vehicleName: string;
}

export function AvailabilityChecker({ vehicleId, vehicleName }: AvailabilityCheckerProps) {
  const router = useRouter();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const formatInputDateTime = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [pickupAt, setPickupAt] = useState(formatInputDateTime(tomorrow));
  const [returnAt, setReturnAt] = useState(formatInputDateTime(dayAfter));
  const [serviceType, setServiceType] = useState<ServiceType>("WITH_DRIVER");
  const [billingUnit, setBillingUnit] = useState<BillingUnit>("DAILY");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const pickupIso = new Date(pickupAt).toISOString();
      const returnIso = new Date(returnAt).toISOString();

      if (new Date(returnIso) <= new Date(pickupIso)) {
        setErrorMsg("Tanggal dan jam pengembalian harus lebih besar dari tanggal penjemputan.");
        setLoading(false);
        return;
      }

      const res = await api.checkAvailability(vehicleId, {
        pickupAt: pickupIso,
        returnAt: returnIso,
        serviceType,
        billingUnit,
      });

      setResult(res);
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Gagal memeriksa ketersediaan. Periksa koneksi internet Anda.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProceedBooking = () => {
    const query = new URLSearchParams({
      vehicleId,
      pickupAt: new Date(pickupAt).toISOString(),
      returnAt: new Date(returnAt).toISOString(),
      serviceType,
      billingUnit,
    });
    router.push(`/booking?${query.toString()}`);
  };

  return (
    <div className="bg-white border border-brand-200 rounded-2xl p-6 shadow-md">
      <div className="flex items-center space-x-2.5 text-brand-950 font-bold text-lg mb-1">
        <Calendar className="w-5 h-5 text-gold-600" />
        <span>Cek Ketersediaan &amp; Estimasi Tarif</span>
      </div>
      <p className="text-xs text-brand-600 mb-5">
        Pilih jadwal rental untuk mengecek apakah unit {vehicleName} tersedia.
      </p>

      <form onSubmit={handleCheck} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-xs font-semibold text-brand-700 block mb-1.5">
              Jadwal Penjemputan
            </label>
            <input
              type="datetime-local"
              value={pickupAt}
              onChange={(e) => setPickupAt(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-200 bg-brand-50/60 focus:bg-white text-xs sm:text-sm text-brand-950 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-brand-950"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-700 block mb-1.5">
              Jadwal Pengembalian
            </label>
            <input
              type="datetime-local"
              value={returnAt}
              onChange={(e) => setReturnAt(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-200 bg-brand-50/60 focus:bg-white text-xs sm:text-sm text-brand-950 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-brand-950"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-xs font-semibold text-brand-700 block mb-1.5">
              Pilihan Layanan
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value as ServiceType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-200 bg-brand-50/60 focus:bg-white text-xs sm:text-sm text-brand-950 focus:outline-none focus:border-brand-950"
            >
              <option value="WITH_DRIVER">Rental dengan Sopir</option>
              <option value="SELF_DRIVE">Rental Lepas Kunci</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-700 block mb-1.5">
              Paket Durasi
            </label>
            <select
              value={billingUnit}
              onChange={(e) => setBillingUnit(e.target.value as BillingUnit)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-200 bg-brand-50/60 focus:bg-white text-xs sm:text-sm text-brand-950 focus:outline-none focus:border-brand-950"
            >
              <option value="DAILY">Sewa Harian (per 24 jam)</option>
              <option value="WEEKLY">Sewa Mingguan (per 7 hari)</option>
              <option value="MONTHLY">Sewa Bulanan (per 30 hari)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-brand-950 hover:bg-brand-800 text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
              <span>Memeriksa Sistem Jadwal...</span>
            </>
          ) : (
            <span>Periksa Ketersediaan Unit</span>
          )}
        </button>
      </form>

      {/* Error Message */}
      {errorMsg && (
        <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="mt-5 pt-5 border-t border-brand-100">
          {result.available ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm block">Unit Tersedia untuk Jadwal Ini</span>
                  <span className="text-xs text-emerald-800 block mt-0.5">
                    Permintaan booking yang Anda ajukan akan dicatat dengan status Pending untuk konfirmasi admin TJ Rentcar.
                  </span>
                </div>
              </div>

              <div className="bg-brand-50 p-4 rounded-xl border border-brand-200 space-y-2 text-xs text-brand-700 tabular-nums">
                <div className="flex justify-between py-1 border-b border-brand-200/70">
                  <span className="text-brand-500">Durasi Rental:</span>
                  <span className="font-semibold text-brand-950">
                    {result.durationDays} Hari ({result.durationUnits} {result.unitName})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-brand-200/70">
                  <span className="text-brand-500">Tarif per {result.unitName}:</span>
                  <span className="font-semibold text-brand-950">
                    {result.unitAmount ? formatRupiah(result.unitAmount) : "Perlu Penawaran"}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-sm font-extrabold text-brand-950 pt-1">
                  <span>Estimasi Total:</span>
                  <span>
                    {result.estimatedTotal ? formatRupiah(result.estimatedTotal) : "Sesuai Penawaran"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedBooking}
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-brand-950 font-extrabold text-sm transition-colors shadow-sm"
              >
                <span>Lanjutkan Isi Data Booking</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">
              <div className="flex items-start space-x-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm block">Unit Tidak Tersedia pada Jadwal Ini</span>
                  <span className="text-xs text-amber-800 block mt-1">
                    {result.conflictReason ||
                      "Unit sudah dipesan oleh pelanggan lain atau dalam jadwal pemeliharaan."}
                  </span>
                  <p className="text-xs text-brand-600 mt-2.5">
                    Silakan pilih tanggal lain atau hubungi admin kami via WhatsApp untuk rekomendasi unit sekelas.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
