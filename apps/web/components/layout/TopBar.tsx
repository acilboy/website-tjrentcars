"use client";

import Link from "next/link";
import { Phone, Clock, MapPin } from "lucide-react";
import { useSiteSettings } from "./SiteSettingsContext";
import { buildWhatsAppLink } from "@/lib/formatters";
import { trackClickWhatsApp } from "@/lib/analytics";

export function TopBar() {
  const settings = useSiteSettings();
  const city = settings?.city || "Jakarta";
  const businessHours = settings?.businessHours;
  const whatsappNumber = settings?.whatsappNumber;

  const waLink = buildWhatsAppLink(
    whatsappNumber,
    "Halo TJ Rentcar, saya ingin bertanya tentang layanan rental mobil."
  );

  return (
    <div className="bg-brand-950 text-brand-300 text-xs py-2 px-4 border-b border-brand-800/80 hidden md:block">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
        <div className="flex items-center space-x-6 min-w-0">
          <div className="flex items-center space-x-1.5 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-gold-400" />
            <span>Operasional: {city} &amp; Sekitarnya</span>
          </div>
          {businessHours && (
            <div className="flex items-center space-x-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-gold-400 shrink-0" />
              <span className="truncate">{businessHours}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4 shrink-0">
          {whatsappNumber ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClickWhatsApp("topbar")}
              className="flex items-center space-x-1.5 font-medium text-brand-100 hover:text-gold-300 transition-colors tabular-nums"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp: +{whatsappNumber.replace(/\D/g, "")}</span>
            </a>
          ) : (
            <Link
              href="/kontak"
              className="text-brand-300 hover:text-gold-300 transition-colors font-medium"
            >
              Konsultasi &amp; Reservasi Online
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
