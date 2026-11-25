"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Car,
  Layers,
  FileText,
  BookOpen,
  Settings,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.adminLogout();
    } catch {}
    router.push("/admin/login");
  };

  const menu = [
    { name: "Ringkasan", href: "/admin", icon: LayoutDashboard },
    { name: "Data Booking", href: "/admin/booking", icon: CalendarCheck },
    { name: "Kalender & Blokir", href: "/admin/kalender", icon: Calendar },
    { name: "Kelola Armada", href: "/admin/mobil", icon: Car },
    { name: "Layanan Rental", href: "/admin/layanan", icon: Layers },
    { name: "Konten & FAQ", href: "/admin/konten", icon: FileText },
    { name: "Artikel Blog", href: "/admin/artikel", icon: BookOpen },
    { name: "Pesan Kontak", href: "/admin/kontak", icon: MessageSquare },
    { name: "Pengaturan Bisnis", href: "/admin/pengaturan", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-brand-950 text-slate-300 flex flex-col justify-between h-screen sticky top-0 border-r border-brand-900 shrink-0">
      <div>
        {/* Brand */}
        <div className="p-5 border-b border-brand-800 flex items-center space-x-3">
          <BrandLogo surface="dark" size="sm" />
          <div>
            <span className="text-sm font-extrabold text-white tracking-tight block">
              TJ Rentcar
            </span>
            <span className="text-[10px] text-gold-400 font-semibold uppercase tracking-wider block">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-1.5 overflow-y-auto">
          {menu.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-800 text-white font-bold shadow-sm text-gold-300"
                    : "text-slate-400 hover:text-white hover:bg-brand-900/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-gold-400" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-brand-900">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-900/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Sesi</span>
        </button>
      </div>
    </aside>
  );
}
