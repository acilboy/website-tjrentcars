import Link from "next/link";
import { Metadata } from "next";
import {
  Car,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  Calendar,
  ChevronDown,
  MapPin,
} from "lucide-react";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { ServiceIcon } from "@/components/services/ServiceIcon";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Vehicle, ServiceItem, FAQ } from "@/types";
import { formatRupiah } from "@/lib/formatters";
import { getAssetUrl } from "@/lib/asset-url";

export const metadata: Metadata = {
  title: "Rental Mobil Jakarta | TJ Rentcar",
  description:
    "Butuh rental mobil di Jakarta? Pilih layanan dengan sopir, lepas kunci, harian, mingguan, atau bulanan dari TJ Rentcar. Cek armada dan ajukan booking.",
  alternates: {
    canonical: "/",
  },
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

async function getHomeData(): Promise<{
  vehicles: Vehicle[];
  services: ServiceItem[];
  faqs: FAQ[];
}> {
  try {
    const [vehiclesRes, servicesRes, faqsRes] = await Promise.all([
      fetch(`${API_BASE}/public/vehicles?limit=6`, { next: { revalidate: 60 } }).catch(() => null),
      fetch(`${API_BASE}/public/services`, { next: { revalidate: 300 } }).catch(() => null),
      fetch(`${API_BASE}/public/faqs`, { next: { revalidate: 300 } }).catch(() => null),
    ]);

    const vehiclesJson = vehiclesRes && vehiclesRes.ok ? await vehiclesRes.json() : null;
    const servicesJson = servicesRes && servicesRes.ok ? await servicesRes.json() : null;
    const faqsJson = faqsRes && faqsRes.ok ? await faqsRes.json() : null;

    return {
      vehicles: vehiclesJson?.data || [],
      services: servicesJson?.data || [],
      faqs: faqsJson?.data || [],
    };
  } catch {
    return { vehicles: [], services: [], faqs: [] };
  }
}

export default async function HomePage() {
  const { vehicles, services, faqs } = await getHomeData();

  const featuredVehicle =
    vehicles.find((v) => v.primaryImage?.url || v.images?.[0]?.url) || null;
  const featuredPhotoUrl = featuredVehicle
    ? getAssetUrl(featuredVehicle.primaryImage?.url || featuredVehicle.images?.[0]?.url)
    : "";

  return (
    <div className="space-y-20 pb-20">
      {/* 1. SPLIT EDITORIAL HERO */}
      <section className="relative bg-brand-950 text-white overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 border-b border-brand-800">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-950"
        />
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold-500/[0.06] to-transparent pointer-events-none"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Hero Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2.5 text-xs font-bold uppercase tracking-widest text-gold-400">
                <span className="w-8 h-0.5 bg-gold-500 inline-block" />
                <span>PT. TJB Nusantara Rental Car • Jakarta</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
                Rental Mobil Jakarta untuk Berbagai Kebutuhan
              </h1>

              <p className="text-base sm:text-lg text-brand-200 leading-relaxed max-w-2xl">
                Solusi mobilitas terencana di Jakarta bersama TJ Rentcar. Tersedia pilihan sewa dengan sopir maupun lepas kunci untuk kebutuhan harian, mingguan, bulanan, antar jemput bandara, serta perjalanan luar kota.
              </p>

              <div className="flex flex-wrap gap-3.5 pt-2">
                <Link
                  href="/mobil"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-brand-950 font-bold text-sm sm:text-base transition-colors shadow-md"
                >
                  <span>Lihat Pilihan Mobil</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/booking"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-brand-900 hover:bg-brand-800 text-white font-semibold text-sm sm:text-base border border-brand-700 transition-colors"
                >
                  <span>Formulir Booking</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-brand-800 text-xs sm:text-sm text-brand-200">
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Unit Bersih &amp; Terawat Rutin</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Clock className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Penjemputan Tepat Waktu</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Tarif Transparan &amp; Jelas</span>
                </div>
              </div>
            </div>

            {/* Hero Showcase: Real API Vehicle Photo OR Official Brand Card */}
            <div className="lg:col-span-5">
              {featuredVehicle && featuredPhotoUrl ? (
                <div className="bg-brand-900/90 border border-brand-800 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="relative aspect-[16/10] bg-brand-800">
                    <img
                      src={featuredPhotoUrl}
                      alt={
                        featuredVehicle.primaryImage?.altText ||
                        `Armada ${featuredVehicle.name} TJ Rentcar Jakarta`
                      }
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-brand-950/90 text-gold-300 border border-gold-500/30 text-[11px] font-semibold uppercase tracking-wider">
                      {featuredVehicle.category}
                    </span>
                  </div>
                  <div className="p-5 flex items-center justify-between gap-4 border-t border-brand-800">
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-gold-400 uppercase tracking-wider block">
                        Armada Tersedia • {featuredVehicle.brand}
                      </span>
                      <p className="text-base font-bold text-white truncate mt-0.5">
                        {featuredVehicle.name}
                      </p>
                      <p className="text-xs text-brand-300 tabular-nums mt-0.5">
                        {featuredVehicle.minRate
                          ? `Mulai ${formatRupiah(featuredVehicle.minRate)} /hari`
                          : "Hubungi admin untuk tarif"}
                      </p>
                    </div>
                    <Link
                      href={`/mobil/${featuredVehicle.slug}`}
                      className="shrink-0 inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white text-brand-950 hover:bg-gold-400 font-bold text-xs transition-colors"
                    >
                      <span>Detail</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between gap-4 border-b border-brand-800 pb-5">
                    <BrandLogo surface="dark" size="lg" />
                    <div className="text-right">
                      <span className="text-xs font-bold uppercase tracking-widest text-gold-400 block">
                        Area Jakarta
                      </span>
                      <span className="text-sm font-bold text-white block mt-1">
                        Dengan Sopir &amp; Lepas Kunci
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2.5 text-xs sm:text-sm text-brand-200">
                    <div className="flex items-center space-x-2.5">
                      <MapPin className="w-4 h-4 text-gold-400 shrink-0" />
                      <span>Jakarta Pusat, Selatan, Barat, Timur, Utara</span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                      <span>Antar Jemput Bandara Soekarno-Hatta &amp; Halim</span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <Calendar className="w-4 h-4 text-gold-400 shrink-0" />
                      <span>Sewa Harian, Mingguan, Bulanan &amp; Luar Kota</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. PENCARIAN CEPAT JADWAL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg border border-brand-200 p-6 sm:p-7">
          <div className="flex items-center space-x-2.5 mb-4">
            <Calendar className="w-5 h-5 text-gold-600" />
            <h2 className="text-base sm:text-lg font-bold text-brand-950">
              Cari Mobil Sesuai Kebutuhan Anda
            </h2>
          </div>

          <form action="/mobil" method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="quick-category"
                className="text-[11px] font-semibold text-brand-600 block mb-1.5 uppercase tracking-wider"
              >
                Tipe Kendaraan
              </label>
              <select
                id="quick-category"
                name="category"
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-200 text-sm text-brand-950 bg-brand-50/60 focus:bg-white focus:outline-none focus:border-brand-950"
              >
                <option value="">Semua Kategori</option>
                <option value="MPV">MPV (Avanza, Xpander)</option>
                <option value="Medium MPV">Medium MPV (Innova Zenix)</option>
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Luxury">Luxury / Mewah</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="quick-transmission"
                className="text-[11px] font-semibold text-brand-600 block mb-1.5 uppercase tracking-wider"
              >
                Transmisi
              </label>
              <select
                id="quick-transmission"
                name="transmission"
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-200 text-sm text-brand-950 bg-brand-50/60 focus:bg-white focus:outline-none focus:border-brand-950"
              >
                <option value="">Semua Transmisi</option>
                <option value="AUTOMATIC">Matic (Otomatis)</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="quick-service"
                className="text-[11px] font-semibold text-brand-600 block mb-1.5 uppercase tracking-wider"
              >
                Pilihan Layanan
              </label>
              <select
                id="quick-service"
                name="serviceType"
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-200 text-sm text-brand-950 bg-brand-50/60 focus:bg-white focus:outline-none focus:border-brand-950"
              >
                <option value="">Semua Layanan</option>
                <option value="WITH_DRIVER">Dengan Sopir</option>
                <option value="SELF_DRIVE">Lepas Kunci</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-brand-950 hover:bg-brand-800 text-white font-bold text-sm transition-colors shadow-sm flex items-center justify-center space-x-2"
              >
                <span>Temukan Mobil</span>
                <ArrowRight className="w-4 h-4 text-gold-400" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 3. ARMADA PILIHAN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 border-b border-brand-100 pb-5">
          <div>
            <span className="text-xs font-bold text-gold-700 uppercase tracking-widest block mb-1">
              Armada TJ Rentcar
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight">
              Pilihan Mobil Rental Jakarta
            </h2>
          </div>
          <Link
            href="/mobil"
            className="text-sm font-bold text-brand-950 hover:text-gold-700 inline-flex items-center space-x-1.5 transition-colors tabular-nums"
          >
            <span>Lihat Semua Armada ({vehicles.length} Unit)</span>
            <ArrowRight className="w-4 h-4 text-gold-600" />
          </Link>
        </div>

        {vehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        ) : (
          <div className="bg-brand-50 rounded-2xl p-12 text-center border border-brand-200">
            <Car className="w-10 h-10 text-gold-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-brand-950">
              Daftar Armada Sedang Diperbarui
            </h3>
            <p className="text-xs text-brand-600 max-w-md mx-auto mt-1.5 mb-5">
              Silakan hubungi layanan pelanggan kami untuk menanyakan unit yang siap jalan untuk kebutuhan hari ini.
            </p>
            <Link
              href="/kontak"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-950 text-white text-xs font-bold hover:bg-brand-800 transition-colors"
            >
              <span>Hubungi Admin</span>
            </Link>
          </div>
        )}
      </section>

      {/* 4. LAYANAN KAMI */}
      <section className="bg-brand-50 py-16 sm:py-20 border-y border-brand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold text-gold-700 uppercase tracking-widest block mb-2">
              Solusi Mobilitas
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight">
              Layanan Rental Mobil Jakarta
            </h2>
            <p className="text-sm text-brand-600 mt-2.5 leading-relaxed">
              Skema sewa kendaraan yang fleksibel untuk perjalanan pribadi, keluarga, antar-jemput bandara, hingga operasional perusahaan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div
                key={s.slug}
                className="bg-white rounded-2xl p-6 border border-brand-200 hover:border-gold-500/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-brand-950 text-gold-400 flex items-center justify-center mb-4">
                    <ServiceIcon slug={s.slug} className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-950 mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-600 leading-relaxed mb-5">
                    {s.shortDescription || (s.description ? s.description.substring(0, 120) + "..." : "")}
                  </p>
                </div>

                <Link
                  href={`/layanan/${s.slug}`}
                  className="text-xs font-bold text-brand-950 group-hover:text-gold-700 inline-flex items-center space-x-1.5 transition-colors pt-3 border-t border-brand-100"
                >
                  <span>Selengkapnya &amp; Ketentuan</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gold-600" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. KEUNGGULAN & ALUR BOOKING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-bold text-gold-700 uppercase tracking-widest block mb-2">
                Standar Operasional
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight">
                Kepercayaan &amp; Kenyamanan Anda Adalah Prioritas Utama
              </h2>
            </div>

            <div className="space-y-5 pt-2">
              <div className="flex items-start space-x-4 p-4 rounded-2xl border border-brand-100 bg-brand-50/50">
                <div className="w-10 h-10 rounded-xl bg-brand-950 text-gold-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-950 mb-1">
                    Armada Selalu Prima &amp; Bersih
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-600 leading-relaxed">
                    Setiap unit melalui pembersihan detail dan pemeriksaan kelayakan mesin sebelum diserahkan kepada penyewa.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-2xl border border-brand-100 bg-brand-50/50">
                <div className="w-10 h-10 rounded-xl bg-brand-950 text-gold-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-950 mb-1">
                    Pengemudi Berpengalaman &amp; Disiplin
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-600 leading-relaxed">
                    Sopir kami menguasai rute jalan Jakarta, aturan ganjil-genap, akses bandara, dan menjaga etika layanan yang santun.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-2xl border border-brand-100 bg-brand-50/50">
                <div className="w-10 h-10 rounded-xl bg-brand-950 text-gold-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-950 mb-1">
                    Transparansi Tarif &amp; Ketentuan
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-600 leading-relaxed">
                    Rincian harga, durasi sewa, dan syarat verifikasi lepas kunci dijelaskan terbuka di awal sebelum konfirmasi booking.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-brand-950 text-white rounded-2xl p-7 sm:p-10 shadow-xl border border-brand-800 space-y-6">
            <div className="border-b border-brand-800 pb-4">
              <span className="text-[11px] font-bold text-gold-400 uppercase tracking-widest block mb-1">
                Prosedur Pemesanan
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Alur Booking Cepat &amp; Terstruktur
              </h3>
            </div>

            <ol className="space-y-4 text-xs sm:text-sm">
              {[
                {
                  num: "01",
                  title: "Pilih Mobil & Layanan",
                  desc: "Tentukan unit kendaraan yang sesuai dengan kapasitas dan jenis layanan (dengan sopir / lepas kunci).",
                },
                {
                  num: "02",
                  title: "Lengkapi Jadwal & Kontak",
                  desc: "Masukkan tanggal penjemputan, lokasi di Jakarta, dan nomor WhatsApp aktif Anda.",
                },
                {
                  num: "03",
                  title: "Permintaan Tercatat (Pending)",
                  desc: "Sistem mencatat pengajuan sewa Anda secara aman dengan status awal Pending.",
                },
                {
                  num: "04",
                  title: "Konfirmasi Resmi oleh Admin",
                  desc: "Admin memeriksa ketersediaan unit (serta verifikasi KTP/SIM khusus lepas kunci) lalu menghubungi Anda.",
                },
              ].map((step) => (
                <li key={step.num} className="flex items-start space-x-3.5">
                  <span className="w-7 h-7 rounded-lg bg-gold-500 text-brand-950 font-extrabold text-xs flex items-center justify-center shrink-0 tabular-nums mt-0.5">
                    {step.num}
                  </span>
                  <div>
                    <strong className="block text-white font-semibold">{step.title}</strong>
                    <span className="text-brand-300 leading-relaxed block mt-0.5">{step.desc}</span>
                  </div>
                </li>
              ))}
            </ol>

            <div className="pt-2">
              <Link
                href="/booking"
                className="w-full inline-flex items-center justify-center py-3.5 px-6 rounded-xl bg-gold-500 hover:bg-gold-400 text-brand-950 font-extrabold text-sm transition-colors shadow-sm"
              >
                <span>Mulai Reservasi Sekarang</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      {faqs.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-gold-700 uppercase tracking-widest block mb-1">
              Tanya Jawab
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => (
              <details
                key={faq.id || idx}
                className="group bg-white rounded-2xl border border-brand-200 p-5 shadow-sm open:border-brand-950 transition-colors"
              >
                <summary className="flex justify-between items-center gap-4 font-bold text-sm sm:text-base text-brand-950 cursor-pointer list-none">
                  <span>{faq.question}</span>
                  <ChevronDown className="w-4 h-4 text-brand-500 shrink-0 group-open:rotate-180 group-open:text-gold-600 transition-transform" />
                </summary>
                <p className="text-xs sm:text-sm text-brand-600 leading-relaxed mt-3 pt-3 border-t border-brand-100">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* 7. CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-950 rounded-2xl p-8 sm:p-12 text-center text-white border-t-2 border-gold-500 shadow-xl">
          <div className="max-w-2xl mx-auto space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400 block">
              Reservasi &amp; Konsultasi Jakarta
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Siap Merencanakan Perjalanan Nyaman di Jakarta?
            </h2>
            <p className="text-sm text-brand-300 leading-relaxed">
              Konsultasikan rute, jadwal antar-jemput bandara, atau kebutuhan rental mobil harian hingga bulanan bersama tim TJ Rentcar.
            </p>
            <div className="flex flex-wrap justify-center gap-3.5 pt-2">
              <Link
                href="/booking"
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-brand-950 font-extrabold text-sm transition-colors"
              >
                <span>Ajukan Booking Online</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/kontak"
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-brand-900 hover:bg-brand-800 text-white font-semibold text-sm border border-brand-700 transition-colors"
              >
                <span>Kontak Layanan Pelanggan</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
