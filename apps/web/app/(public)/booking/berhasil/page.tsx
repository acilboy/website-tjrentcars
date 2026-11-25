import { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Clock, ArrowRight, Home } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { formatRupiah, formatDateTime, buildWhatsAppLink } from "@/lib/formatters";

export const metadata: Metadata = {
  title: "Permintaan Booking Berhasil | TJ Rentcar Jakarta",
  description:
    "Permintaan booking rental mobil Anda telah tercatat dan sedang menunggu konfirmasi admin TJ Rentcar.",
  robots: {
    index: false,
    follow: true,
  },
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

async function getSettings() {
  try {
    const res = await fetch(`${API_BASE}/public/settings`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: { code?: string; vehicle?: string; pickup?: string; return?: string; total?: string };
}) {
  const settings = await getSettings();
  const bookingCode = searchParams.code || "TJ-PENDING";
  const vehicleName = searchParams.vehicle || "Armada TJ Rentcar";
  const pickupAt = searchParams.pickup ? formatDateTime(searchParams.pickup) : "-";
  const returnAt = searchParams.return ? formatDateTime(searchParams.return) : "-";
  const totalAmount = searchParams.total ? parseInt(searchParams.total, 10) : null;

  const waMessage = `Halo Admin TJ Rentcar, saya baru saja mengajukan booking melalui website dengan Kode Booking: ${bookingCode} untuk unit ${vehicleName}. Mohon konfirmasi ketersediaan dan proses selanjutnya.`;
  const waLink = buildWhatsAppLink(settings?.whatsappNumber, waMessage);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
      <div className="bg-white rounded-2xl border border-brand-200 border-t-4 border-t-gold-500 shadow-lg overflow-hidden p-7 sm:p-10 text-center space-y-6">
        <div className="flex justify-center">
          <BrandLogo logoUrl={settings?.logoUrl} surface="light" size="md" />
        </div>

        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
          <Clock className="w-7 h-7" />
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2.5">
            Status: Menunggu Konfirmasi (Pending)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight">
            Permintaan Booking Telah Diterima
          </h1>
          <p className="text-xs sm:text-sm text-brand-600 mt-2 max-w-md mx-auto leading-relaxed">
            Terima kasih. Permintaan rental Anda telah tersimpan di sistem kami. Tim admin kami akan segera memeriksa ketersediaan fisik armada dan menghubungi Anda.
          </p>
        </div>

        {/* Booking Code Card */}
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5 text-left space-y-3 tabular-nums">
          <div className="flex justify-between items-center pb-3 border-b border-brand-200">
            <span className="text-xs font-semibold text-brand-600">Kode Booking Anda:</span>
            <span className="text-base font-extrabold text-brand-950 font-mono tracking-wider">
              {bookingCode}
            </span>
          </div>

          <div className="text-xs text-brand-700 space-y-1.5">
            <div className="flex justify-between gap-4">
              <span className="text-brand-500">Armada:</span>
              <span className="font-semibold text-brand-950 text-right">{vehicleName}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-brand-500">Jadwal Jemput:</span>
              <span className="font-semibold text-brand-950 text-right">{pickupAt}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-brand-500">Jadwal Selesai:</span>
              <span className="font-semibold text-brand-950 text-right">{returnAt}</span>
            </div>
            {totalAmount !== null && !Number.isNaN(totalAmount) && (
              <div className="flex justify-between pt-2 border-t border-brand-200 text-sm font-extrabold text-brand-950">
                <span>Estimasi Biaya:</span>
                <span>{formatRupiah(totalAmount)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-1">
          {settings?.whatsappNumber ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors shadow-sm"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Konfirmasi Cepat via WhatsApp</span>
            </a>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/"
              className="flex items-center justify-center space-x-1.5 py-3 px-4 rounded-xl border border-brand-200 text-brand-700 hover:bg-brand-50 text-xs font-semibold transition-colors"
            >
              <Home className="w-4 h-4 text-brand-500" />
              <span>Kembali ke Beranda</span>
            </Link>
            <Link
              href="/mobil"
              className="flex items-center justify-center space-x-1.5 py-3 px-4 rounded-xl bg-brand-950 hover:bg-brand-800 text-white text-xs font-bold transition-colors"
            >
              <span>Katalog Mobil</span>
              <ArrowRight className="w-4 h-4 ml-1 text-gold-400" />
            </Link>
          </div>
        </div>

        <p className="text-[11px] text-brand-500 leading-normal">
          *Catatan: Permintaan booking baru ini belum mengunci kendaraan secara permanen sampai admin melakukan verifikasi ketersediaan dan menyetujui jadwal.
        </p>
      </div>
    </div>
  );
}
