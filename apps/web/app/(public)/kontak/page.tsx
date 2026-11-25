import { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ContactFormClient } from "./ContactFormClient";
import { Phone, Mail, Clock, MapPin, MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/formatters";

export const metadata: Metadata = {
  title: "Kontak TJ Rentcar Jakarta | Booking dan Informasi",
  description:
    "Hubungi TJ Rentcar untuk informasi armada, tarif, jadwal, dan pemesanan rental mobil di Jakarta melalui kanal kontak resmi.",
  alternates: {
    canonical: "/kontak",
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

export default async function ContactPage() {
  const settings = await getSettings();

  const breadcrumbs = [{ name: "Kontak", item: "/kontak" }];

  const waLink = buildWhatsAppLink(
    settings?.whatsappNumber,
    "Halo TJ Rentcar, saya ingin bertanya tentang armada dan layanan rental mobil di Jakarta."
  );

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mb-10 border-b border-brand-100 pb-6">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-gold-700 uppercase tracking-widest mb-2">
            <span className="w-6 h-0.5 bg-gold-500 inline-block" />
            <span>Layanan Pelanggan</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-950 tracking-tight">
            Hubungi TJ Rentcar
          </h1>
          <p className="text-sm sm:text-base text-brand-600 mt-3 leading-relaxed">
            Tim kami siap membantu Anda mendapatkan armada yang tepat untuk perjalanan bisnis, wisata, maupun operasional harian di wilayah Jakarta dan sekitarnya.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Info Side */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-brand-950 text-white rounded-2xl p-8 shadow-xl border-t-2 border-gold-500 space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-brand-800 pb-4">
                Informasi Kontak Resmi
              </h2>

              <div className="space-y-5 text-sm">
                {settings?.whatsappNumber ? (
                  <div className="flex items-start space-x-3.5">
                    <MessageCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs text-brand-400 block">WhatsApp Resmi:</span>
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-bold text-emerald-400 hover:text-emerald-300 tabular-nums"
                      >
                        +{settings.whatsappNumber.replace(/\D/g, "")}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-3.5">
                    <MessageCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs text-brand-400 block">WhatsApp Resmi:</span>
                      <span className="text-sm font-semibold text-brand-200">
                        Hubungi via formulir di samping
                      </span>
                    </div>
                  </div>
                )}

                {settings?.phoneNumber && (
                  <div className="flex items-start space-x-3.5">
                    <Phone className="w-5 h-5 text-gold-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs text-brand-400 block">Telepon Kantor:</span>
                      <span className="font-semibold text-brand-100 tabular-nums">
                        {settings.phoneNumber}
                      </span>
                    </div>
                  </div>
                )}

                {settings?.email && (
                  <div className="flex items-start space-x-3.5">
                    <Mail className="w-5 h-5 text-gold-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs text-brand-400 block">Email Resmi:</span>
                      <a
                        href={`mailto:${settings.email}`}
                        className="text-brand-100 hover:text-gold-300 break-all"
                      >
                        {settings.email}
                      </a>
                    </div>
                  </div>
                )}

                {settings?.businessHours && (
                  <div className="flex items-start space-x-3.5">
                    <Clock className="w-5 h-5 text-gold-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs text-brand-400 block">Jam Operasional:</span>
                      <span className="text-brand-100">{settings.businessHours}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3.5">
                  <MapPin className="w-5 h-5 text-gold-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-brand-400 block">Area Layanan Utama:</span>
                    <span className="text-brand-100">
                      {settings?.serviceAreas?.join(", ") ||
                        "Jakarta Pusat, Selatan, Barat, Timur, Utara, Bandara CGK & HLP"}
                    </span>
                  </div>
                </div>

                {settings?.showPublicAddress && settings?.publicAddress && (
                  <div className="flex items-start space-x-3.5">
                    <MapPin className="w-5 h-5 text-gold-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs text-brand-400 block">Alamat Kantor:</span>
                      <span className="text-brand-100">{settings.publicAddress}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-brand-200 p-7 sm:p-9 shadow-sm">
              <h2 className="text-xl font-bold text-brand-950 mb-1.5">
                Kirim Pesan atau Pertanyaan
              </h2>
              <p className="text-xs sm:text-sm text-brand-600 mb-6">
                Silakan isi pesan di bawah. Tim admin TJ Rentcar akan segera membalas pertanyaan Anda.
              </p>

              <ContactFormClient />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
