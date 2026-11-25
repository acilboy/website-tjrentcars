"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { api } from "@/lib/api-client";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  const [loading, setLoading] = useState(!isLoginPage);
  const [admin, setAdmin] = useState<any | null>(null);

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    api.getAdminMe()
      .then((data) => {
        setAdmin(data);
        setLoading(false);
      })
      .catch(() => {
        router.push("/admin/login");
      });
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-900">{children}</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-900 mb-3" />
        <span className="text-xs font-semibold text-slate-500">Memverifikasi sesi admin...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">
            <span>Portal Operasional Resmi TJ Rentcar Jakarta</span>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="font-semibold text-brand-950">{admin?.name || "Admin"}</span>
            <span className="px-2 py-0.5 rounded-full bg-gold-100 text-gold-800 font-bold uppercase text-[10px]">
              {admin?.role || "ADMIN"}
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
