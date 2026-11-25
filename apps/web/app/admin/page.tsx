"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Clock,
  Car,
  AlertTriangle,
  ArrowRight,
  Plus,
  Calendar,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { DashboardStats } from "@/types";
import { formatDateTime } from "@/lib/formatters";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardStats()
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight">
            Ringkasan Operasional
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau status pemesanan, ketersediaan unit armada, dan pesan masuk.
          </p>
        </div>

        <div className="flex space-x-3">
          <Link
            href="/admin/mobil/tambah"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mobil</span>
          </Link>
          <Link
            href="/admin/kalender"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
          >
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Lihat Kalender</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Pending */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Menunggu Konfirmasi</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-950">
            {stats?.pendingBookings ?? "-"}
          </div>
          <Link href="/admin/booking?status=PENDING" className="text-[11px] text-amber-700 hover:underline mt-2 inline-block font-semibold">
            Lihat Permintaan Pending →
          </Link>
        </div>

        {/* Confirmed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Terkonfirmasi</span>
            <CalendarCheck className="w-4 h-4 text-brand-700" />
          </div>
          <div className="text-3xl font-extrabold text-brand-950">
            {stats?.confirmedBookings ?? "-"}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">Jadwal armada terkunci</span>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sedang Berjalan</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-brand-950">
            {stats?.inProgressBookings ?? "-"}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">Unit sedang di tangan penyewa</span>
        </div>

        {/* Active Vehicles / Maintenance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Armada Aktif</span>
            <Car className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-3xl font-extrabold text-brand-950">
            {stats?.activeVehicles ?? "-"}{" "}
            <span className="text-xs font-normal text-slate-400">/ {stats?.totalVehicles ?? "-"} unit</span>
          </div>
          {stats && stats.maintenanceVehicles > 0 ? (
            <span className="text-[11px] text-rose-600 font-semibold mt-2 block">
              {stats.maintenanceVehicles} unit dalam perbaikan
            </span>
          ) : (
            <span className="text-[11px] text-emerald-600 font-semibold mt-2 block">
              Semua unit siap jalan
            </span>
          )}
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-brand-950">Pemesanan Terbaru</h2>
            <p className="text-xs text-slate-400 mt-0.5">5 transaksi pemesanan terakhir dari pelanggan</p>
          </div>
          <Link
            href="/admin/booking"
            className="text-xs font-bold text-brand-900 hover:text-gold-600 flex items-center space-x-1"
          >
            <span>Semua Data Booking</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-4">Kode</th>
                <th className="p-4">Pelanggan</th>
                <th className="p-4">Kendaraan</th>
                <th className="p-4">Jadwal Jemput</th>
                <th className="p-4">Layanan</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                stats.recentBookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono font-bold text-brand-950">{b.bookingCode}</td>
                    <td className="p-4 font-medium text-slate-900">{b.customerName}</td>
                    <td className="p-4">{b.vehicle?.name || "-"}</td>
                    <td className="p-4 text-slate-500">{formatDateTime(b.pickupAt)}</td>
                    <td className="p-4">
                      {b.serviceType === "WITH_DRIVER" ? "Dengan Sopir" : "Lepas Kunci"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          b.status === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : b.status === "CONFIRMED"
                            ? "bg-blue-100 text-blue-800"
                            : b.status === "IN_PROGRESS"
                            ? "bg-emerald-100 text-emerald-800"
                            : b.status === "COMPLETED"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/booking?id=${b.id}`}
                        className="px-3 py-1 rounded-lg border border-slate-200 text-brand-900 font-semibold hover:bg-slate-100"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Belum ada data pemesanan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
