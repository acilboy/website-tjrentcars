"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, MessageCircle, ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useSiteSettings } from "./SiteSettingsContext";
import { buildWhatsAppLink } from "@/lib/formatters";
import { trackClickWhatsApp } from "@/lib/analytics";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const settings = useSiteSettings();
  const pathname = usePathname();

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Pilihan Mobil", href: "/mobil" },
    { name: "Layanan", href: "/layanan" },
    { name: "Tentang Kami", href: "/tentang-kami" },
    { name: "Syarat & Ketentuan", href: "/syarat-ketentuan" },
    { name: "Artikel", href: "/artikel" },
    { name: "Kontak", href: "/kontak" },
  ];

  const businessName = settings?.businessName || "TJ Rentcar";
  const waLink = buildWhatsAppLink(
    settings?.whatsappNumber,
    "Halo TJ Rentcar, saya ingin konsultasi dan booking armada rental mobil di Jakarta."
  );

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-3">
          {/* Official Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 shrink-0">
            <BrandLogo
              logoUrl={settings?.logoUrl}
              alt={`${businessName} — Rental Mobil Jakarta`}
              surface="light"
              size="md"
            />
            <div className="hidden sm:block leading-tight">
              <span className="text-base xl:text-lg font-extrabold tracking-tight text-brand-950 block">
                {businessName}
              </span>
              <span className="text-[11px] font-semibold text-gold-700 tracking-wider uppercase block">
                Rental Mobil Jakarta
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Navigasi Utama" className="hidden lg:flex items-center space-x-0.5 xl:space-x-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-2.5 xl:px-3 py-2 text-[13px] xl:text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "text-brand-950 font-semibold"
                      : "text-brand-600 hover:text-brand-950"
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-2.5 -bottom-[1px] h-0.5 bg-gold-500 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTA Actions */}
          <div className="hidden sm:flex items-center space-x-2.5 shrink-0">
            {settings?.whatsappNumber && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClickWhatsApp("navbar")}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            )}

            <Link
              href="/booking"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs xl:text-sm font-bold text-brand-950 bg-gold-500 hover:bg-gold-400 transition-colors shadow-sm whitespace-nowrap"
            >
              <span>Booking Mobil</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 lg:hidden shrink-0">
            <Link
              href="/booking"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-brand-950 bg-gold-500 hover:bg-gold-400 sm:hidden"
            >
              Booking
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-brand-700 hover:text-brand-950 hover:bg-brand-50 border border-brand-200"
              aria-label="Toggle Navigation Menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="lg:hidden border-b border-brand-200 bg-white px-4 pt-3 pb-6 space-y-1.5 shadow-lg">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "text-brand-950 bg-brand-50 border-l-2 border-gold-500 font-semibold"
                    : "text-brand-600 hover:bg-brand-50 hover:text-brand-950"
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          <div className="pt-4 mt-2 border-t border-brand-100 space-y-2.5">
            {settings?.whatsappNumber && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackClickWhatsApp("mobile_menu");
                  setIsOpen(false);
                }}
                className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Chat WhatsApp Admin</span>
              </a>
            )}
            <Link
              href="/booking"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center space-x-2 w-full py-3 rounded-xl text-sm font-bold text-brand-950 bg-gold-500 hover:bg-gold-400"
            >
              <span>Booking Kendaraan Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
