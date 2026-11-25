"use client";

import { MessageCircle } from "lucide-react";
import { useSiteSettings } from "./SiteSettingsContext";
import { buildWhatsAppLink } from "@/lib/formatters";
import { trackClickWhatsApp } from "@/lib/analytics";

export function WhatsAppFloating() {
  const settings = useSiteSettings();

  if (!settings?.whatsappNumber) return null;

  const waLink = buildWhatsAppLink(
    settings.whatsappNumber,
    "Halo TJ Rentcar, saya tertarik untuk menyewa mobil di Jakarta. Mohon informasi ketersediaan unit."
  );

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackClickWhatsApp("floating_button")}
        className="flex items-center space-x-2.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-full shadow-xl border border-emerald-500/40 transition-colors"
        aria-label="Hubungi Admin TJ Rentcar via WhatsApp"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 fill-current" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
        </div>
        <div className="text-left hidden sm:block">
          <span className="text-[10px] block text-emerald-100 font-medium leading-none">
            Ada pertanyaan?
          </span>
          <span className="text-xs font-bold block leading-tight mt-0.5">
            Chat WhatsApp
          </span>
        </div>
      </a>
    </div>
  );
}
