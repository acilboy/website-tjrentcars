import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { ServiceIcon } from "@/components/services/ServiceIcon";
import { getAssetUrl } from "@/lib/asset-url";

interface Props {
  params: { slug: string };
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

const SEO_CONFIG: Record<
  string,
  { title: string; description: string; h1: string; targetKeyword: string }
> = {
  "dengan-sopir": {
    title: "Rental Mobil dengan Sopir Jakarta | TJ Rentcar",
    description:
      "Cari rental mobil dengan sopir di Jakarta untuk perjalanan pribadi, keluarga, atau bisnis. Lihat pilihan armada, ketentuan, dan ajukan booking ke TJ Rentcar.",
    h1: "Rental Mobil dengan Sopir di Jakarta",
    targetKeyword: "rental mobil dengan sopir Jakarta",
  },
  "lepas-kunci": {
    title: "Rental Mobil Lepas Kunci Jakarta | TJ Rentcar",
    description:
      "Butuh mobil tanpa sopir di Jakarta? Pelajari pilihan armada, persyaratan, durasi sewa, dan proses booking lepas kunci TJ Rentcar.",
    h1: "Rental Mobil Lepas Kunci di Jakarta",
    targetKeyword: "rental mobil lepas kunci Jakarta",
  },
  "sewa-harian": {
    title: "Sewa Mobil Harian Jakarta | TJ Rentcar",
    description:
      "Temukan pilihan sewa mobil harian di Jakarta dari TJ Rentcar. Cek tarif, durasi, pilihan layanan, dan ketersediaan kendaraan.",
    h1: "Sewa Mobil Harian di Jakarta",
    targetKeyword: "sewa mobil harian Jakarta",
  },
  "sewa-mingguan": {
    title: "Rental Mobil Mingguan Jakarta | TJ Rentcar",
    description:
      "Butuh kendaraan selama beberapa hari? Lihat pilihan rental mobil mingguan TJ Rentcar di Jakarta, ketentuan sewa, dan cara pemesanannya.",
    h1: "Rental Mobil Mingguan di Jakarta",
    targetKeyword: "rental mobil mingguan Jakarta",
  },
  "sewa-bulanan": {
    title: "Rental Mobil Bulanan Jakarta | TJ Rentcar",
    description:
      "Cari rental mobil bulanan di Jakarta untuk kebutuhan kerja atau operasional. Tinjau pilihan armada, tarif, dan ketentuan dari TJ Rentcar.",
    h1: "Rental Mobil Bulanan di Jakarta",
    targetKeyword: "rental mobil bulanan Jakarta",
  },
  "antar-jemput-bandara": {
    title: "Antar Jemput Bandara dari Jakarta | TJ Rentcar",
    description:
      "Atur perjalanan menuju atau dari bandara dengan TJ Rentcar. Periksa bandara yang dilayani, area penjemputan, tarif, dan cara booking.",
    h1: "Layanan Antar Jemput Bandara dari Jakarta",
    targetKeyword: "antar jemput bandara dari Jakarta",
  },
  "perjalanan-luar-kota": {
    title: "Rental Mobil Perjalanan Luar Kota dari Jakarta | TJ Rentcar",
    description:
      "Rencanakan perjalanan luar kota dengan keberangkatan dari Jakarta. Tanyakan rute yang dilayani, pilihan mobil, ketentuan perjalanan, dan estimasi biaya.",
    h1: "Rental Mobil untuk Perjalanan Luar Kota dari Jakarta",
    targetKeyword: "rental mobil luar kota dari Jakarta",
  },
};

async function getServiceDetail(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/public/services/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getServiceDetail(params.slug);
  const fallbackSeo = SEO_CONFIG[params.slug] || {
    title: `${service?.title || "Layanan Rental"} Jakarta | TJ Rentcar`,
    description: service?.shortDescription || "Layanan rental mobil terpercaya di Jakarta.",
  };

  const title = service?.metaTitle || fallbackSeo.title;
  const description = service?.metaDescription || fallbackSeo.description;

  return {
    title,
    description,
    alternates: {
      canonical: `/layanan/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      images: service?.ogImageUrl ? [{ url: getAssetUrl(service.ogImageUrl) }] : undefined,
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const service = await getServiceDetail(params.slug);

  if (!service) {
    notFound();
  }

  const seo = SEO_CONFIG[params.slug] || {
    h1: service.title,
    targetKeyword: service.title,
  };

  const breadcrumbs = [
    { name: "Layanan", item: "/layanan" },
    { name: service.title, item: `/layanan/${service.slug}` },
  ];

  const isSelfDrive = service.slug === "lepas-kunci";

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />

      {/* Header Banner */}
      <section className="bg-brand-950 text-white py-14 border-b border-brand-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2.5 text-xs font-bold text-gold-400 uppercase tracking-widest">
              <ServiceIcon slug={service.slug} className="w-4 h-4 text-gold-400" />
              <span>Layanan TJ Rentcar Jakarta</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              {seo.h1}
            </h1>
            <p className="text-base sm:text-lg text-brand-200 leading-relaxed">
              {service.shortDescription || service.description}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content Details */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-2xl border border-brand-200 p-7 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-brand-950">
                Tentang Layanan Ini
              </h2>
              <div className="text-sm text-brand-700 leading-relaxed space-y-4 whitespace-pre-line">
                {service.description}
              </div>

              <div className="pt-5 border-t border-brand-100">
                <h3 className="text-sm font-bold text-brand-950 mb-3">
                  Ketentuan &amp; Standar Layanan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-brand-700">
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Armada bersih, terawat, dan diperiksa sebelum jalan</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      {isSelfDrive
                        ? "Wajib verifikasi dokumen KTP dan SIM yang aktif"
                        : "Pengemudi berpengalaman memahami rute Jakarta"}
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Koordinasi unit cadangan bila terjadi kendala teknis</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Konfirmasi jadwal dan tarif jelas oleh admin TJ Rentcar</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Vehicles */}
            {service.vehicles && service.vehicles.length > 0 && (
              <div className="space-y-5">
                <div className="flex justify-between items-end border-b border-brand-100 pb-4">
                  <div>
                    <span className="text-xs font-bold text-gold-700 uppercase tracking-widest block">
                      Pilihan Armada
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-brand-950">
                      Mobil untuk {service.title}
                    </h2>
                  </div>
                  <Link
                    href="/mobil"
                    className="text-xs font-bold text-brand-950 hover:text-gold-700 inline-flex items-center space-x-1 transition-colors"
                  >
                    <span>Katalog Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gold-600" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {service.vehicles.map((v: any) => (
                    <VehicleCard key={v.id} vehicle={v} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar CTA */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-brand-50 rounded-2xl border border-brand-200 p-6 space-y-5 lg:sticky lg:top-24">
              <h3 className="text-base font-bold text-brand-950">
                Pesan Layanan {service.title}
              </h3>
              <p className="text-xs text-brand-600 leading-relaxed">
                Pilih kendaraan dan isi tanggal rental Anda pada formulir pemesanan online kami.
              </p>

              <Link
                href={
                  isSelfDrive
                    ? "/booking?serviceType=SELF_DRIVE"
                    : "/booking?serviceType=WITH_DRIVER"
                }
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-brand-950 font-extrabold text-sm shadow-sm transition-colors"
              >
                <span>Ajukan Booking Online</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="pt-4 border-t border-brand-200 space-y-2.5 text-xs text-brand-600">
                <div className="flex items-center space-x-2 font-semibold text-brand-950">
                  <ShieldCheck className="w-4 h-4 text-gold-700" />
                  <span>Proses Transparan &amp; Aman</span>
                </div>
                <p>
                  Setiap reservasi baru masuk dengan status <strong>Pending</strong> dan diperiksa ketersediaannya oleh admin kami sebelum dikonfirmasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
