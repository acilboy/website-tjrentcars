import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ServiceIcon } from "@/components/services/ServiceIcon";
import { ServiceItem } from "@/types";

export const metadata: Metadata = {
  title: "Layanan Rental Mobil Jakarta | TJ Rentcar",
  description:
    "Pilihan layanan rental mobil lengkap di Jakarta: dengan sopir, lepas kunci, sewa harian, mingguan, bulanan, antar jemput bandara, dan perjalanan luar kota.",
  alternates: {
    canonical: "/layanan",
  },
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

async function getServices(): Promise<ServiceItem[]> {
  try {
    const res = await fetch(`${API_BASE}/public/services`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function ServicesPage() {
  const services = await getServices();

  const breadcrumbs = [{ name: "Layanan Rental", item: "/layanan" }];

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mb-12 border-b border-brand-100 pb-6">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-gold-700 uppercase tracking-widest mb-2">
            <span className="w-6 h-0.5 bg-gold-500 inline-block" />
            <span>Layanan TJ Rentcar</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-950 tracking-tight">
            Layanan Rental Mobil Lengkap di Jakarta
          </h1>
          <p className="text-sm sm:text-base text-brand-600 mt-3 leading-relaxed">
            TJ Rentcar menghadirkan solusi mobilitas darat untuk kawasan DKI Jakarta dan sekitarnya. Baik untuk kebutuhan personal, operasional perusahaan, maupun perjalanan keluarga ke luar kota.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {services.map((service) => (
            <div
              key={service.slug}
              className="bg-white rounded-2xl p-7 border border-brand-200 hover:border-gold-500/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-950 text-gold-400 flex items-center justify-center mb-5 group-hover:bg-gold-500 group-hover:text-brand-950 transition-colors">
                  <ServiceIcon slug={service.slug} className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-brand-950 mb-2.5 group-hover:text-gold-700 transition-colors">
                  {service.title}
                </h2>
                <p className="text-xs sm:text-sm text-brand-600 leading-relaxed mb-6">
                  {service.shortDescription ||
                    (service.description ? service.description.substring(0, 140) + "..." : "")}
                </p>
              </div>

              <div className="pt-4 border-t border-brand-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-500 tabular-nums">
                  {service.totalVehicles ? `${service.totalVehicles} Pilihan Unit` : "Unit Siap Jalan"}
                </span>
                <Link
                  href={`/layanan/${service.slug}`}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-950 hover:text-gold-700 transition-colors"
                >
                  <span>Detail &amp; Ketentuan</span>
                  <ArrowRight className="w-4 h-4 text-gold-600" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
