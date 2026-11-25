"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useSiteSettings } from "./SiteSettingsContext";
import { buildWhatsAppLink } from "@/lib/formatters";
import { trackClickWhatsApp } from "@/lib/analytics";

export function Footer() {
  const settings = useSiteSettings();

  const businessName = settings?.businessName || "TJ Rentcar";
  const waLink = buildWhatsAppLink(
    settings?.whatsappNumber,
    "Halo TJ Rentcar, saya ingin informasi mengenai ketersediaan mobil dan layanan rental."
  );

  return (
    <footer className="bg-brand-950 text-brand-300 pt-16 pb-10 border-t-2 border-gold-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">
          {/* Col 1: Brand Info with Official Logo */}
          <div>
            <div className="flex items-center space-x-3.5 mb-5">
              <BrandLogo
                logoUrl={settings?.logoUrl}
                alt={`${businessName} — PT. TJB Nusantara Rental Car`}
                surface="dark"
                size="md"
              />
              <div>
                <span className="text-lg font-extrabold tracking-tight text-white block leading-tight">
                  {businessName}
                </span>
                <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-wider block mt-0.5">
                  Rental Mobil Jakarta
                </span>
              </div>
            </div>
            <p className="text-sm text-brand-300 leading-relaxed mb-4">
              {settings?.tagline ||
                "Penyedia layanan rental mobil profesional dan terpercaya di Jakarta. Melayani sewa dengan sopir, lepas kunci, harian, mingguan, bulanan, dan antar jemput bandara."}
            </p>
            <div className="inline-flex items-center space-x-2 text-xs text-gold-300 bg-brand-900 border border-brand-800 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0" />
              <span>Unit Terawat &amp; Legalitas Jelas</span>
            </div>
          </div>

          {/* Col 2: Layanan Utama */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Pilihan Layanan
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Rental dengan Sopir", href: "/layanan/dengan-sopir" },
                { label: "Rental Lepas Kunci", href: "/layanan/lepas-kunci" },
                { label: "Sewa Mobil Harian", href: "/layanan/sewa-harian" },
                { label: "Rental Mingguan", href: "/layanan/sewa-mingguan" },
                { label: "Rental Bulanan Korporat", href: "/layanan/sewa-bulanan" },
                { label: "Antar Jemput Bandara CGK / HLP", href: "/layanan/antar-jemput-bandara" },
                { label: "Perjalanan Luar Kota dari Jakarta", href: "/layanan/perjalanan-luar-kota" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-gold-300 transition-colors inline-flex items-center space-x-1.5 group"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-brand-500 group-hover:text-gold-400 transition-colors" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Navigasi Cepat & Legal */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Informasi &amp; Panduan
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Katalog Armada Mobil", href: "/mobil" },
                { label: "Formulir Booking Online", href: "/booking" },
                { label: "Tentang TJ Rentcar", href: "/tentang-kami" },
                { label: "Syarat & Ketentuan Rental", href: "/syarat-ketentuan" },
                { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
                { label: "Artikel & Tips Perjalanan", href: "/artikel" },
                { label: "Hubungi Kami", href: "/kontak" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-gold-300 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Area & Kontak Operasional */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Area &amp; Operasional
            </h4>
            <div className="space-y-3.5 text-sm text-brand-300">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-gold-400 mt-1 shrink-0" />
                <div>
                  <span className="font-semibold text-white block">Area Layanan Utama:</span>
                  <span>
                    {settings?.serviceAreas?.join(", ") ||
                      "Jakarta Pusat, Selatan, Barat, Timur, Utara"}
                  </span>
                </div>
              </div>

              {settings?.showPublicAddress && settings?.publicAddress && (
                <div className="flex items-start space-x-2.5">
                  <MapPin className="w-4 h-4 text-gold-400 mt-1 shrink-0" />
                  <div>
                    <span className="font-semibold text-white block">Kantor Operasional:</span>
                    <span>{settings.publicAddress}</span>
                  </div>
                </div>
              )}

              {settings?.businessHours && (
                <div className="flex items-start space-x-2.5">
                  <Clock className="w-4 h-4 text-gold-400 mt-1 shrink-0" />
                  <div>
                    <span className="font-semibold text-white block">Jam Operasional:</span>
                    <span>{settings.businessHours}</span>
                  </div>
                </div>
              )}

              {settings?.whatsappNumber && (
                <div className="flex items-center space-x-2.5 pt-1">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackClickWhatsApp("footer")}
                    className="hover:text-emerald-300 font-semibold text-emerald-400 tabular-nums"
                  >
                    +{settings.whatsappNumber.replace(/\D/g, "")}
                  </a>
                </div>
              )}

              {settings?.email && (
                <div className="flex items-center space-x-2.5">
                  <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                  <a href={`mailto:${settings.email}`} className="hover:text-gold-300 break-all">
                    {settings.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-brand-800/80 flex flex-col sm:flex-row justify-between items-center text-xs text-brand-400 gap-4">
          <p>© {new Date().getFullYear()} {businessName}. Hak cipta dilindungi undang-undang.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/syarat-ketentuan" className="hover:text-brand-200 transition-colors">
              Syarat &amp; Ketentuan
            </Link>
            <Link href="/kebijakan-privasi" className="hover:text-brand-200 transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="/admin/login" className="hover:text-brand-200 transition-colors">
              Portal Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
