"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Search,
  Filter,
  MessageCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Edit3,
} from "lucide-react";
import { api, ApiClientError } from "@/lib/api-client";
import { Booking, BookingStatus } from "@/types";
import { formatDateTime, formatRupiah, buildWhatsAppLink } from "@/lib/formatters";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    setLoadError(null);

    const params: Record<string, any> = {};
    if (statusFilter) params.status = statusFilter;
    if (search.trim()) params.search = search.trim();

    try {
      // api-client already unwraps the API envelope and returns json.data.
      // The admin bookings endpoint therefore returns Booking[] directly.
      const result = await api.getAdminBookings(params);
      setBookings(Array.isArray(result) ? result : []);
    } catch (err) {
      setBookings([]);
      setLoadError(
        err instanceof Error
          ? err.message
          : "Gagal memuat data booking. Silakan coba kembali."
      );
    } finally {
      setLoading(false);
    }
  };

  // Support the dashboard shortcut: /admin/booking?status=PENDING
  useEffect(() => {
    const requestedStatus = new URLSearchParams(window.location.search).get("status");
    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "IN_PROGRESS",
      "COMPLETED",
      "REJECTED",
      "CANCELLED",
    ];

    if (requestedStatus && allowedStatuses.includes(requestedStatus)) {
      setStatusFilter(requestedStatus);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleSelectBooking = (b: Booking) => {
    setSelectedBooking(b);
    setAdminNoteInput(b.adminNote || "");
    setActionError(null);
  };

  const handleStatusChange = async (newStatus: BookingStatus) => {
    if (!selectedBooking) return;
    setActionLoading(true);
    setActionError(null);

    try {
      const updated = await api.updateBookingStatus(selectedBooking.id, {
        status: newStatus,
      });

      setSelectedBooking(updated);
      fetchBookings();
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        setActionError(err.message);
      } else {
        setActionError("Gagal mengubah status booking.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    setActionError(null);

    try {
      const updated = await api.updateBookingNotes(selectedBooking.id, {
        adminNote: adminNoteInput,
      });
      setSelectedBooking(updated);
      fetchBookings();
    } catch (err: any) {
      setActionError(err.message || "Gagal menyimpan catatan.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight">
          Manajemen Pemesanan Pelanggan
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Periksa permintaan sewa, konfirmasi ketersediaan fisik armada, dan hubungi pelanggan.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode booking / nama / telepon..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-900"
          />
        </form>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          {["", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? "bg-brand-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st === "" ? "Semua Status" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table and Detail Modal/Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table List */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-4">Kode</th>
                  <th className="p-4">Pelanggan</th>
                  <th className="p-4">Mobil</th>
                  <th className="p-4">Jemput</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-900" />
                      <span>Memuat data booking...</span>
                    </td>
                  </tr>
                ) : loadError ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-rose-600">
                      {loadError}
                    </td>
                  </tr>
                ) : bookings.length > 0 ? (
                  bookings.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => handleSelectBooking(b)}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                        selectedBooking?.id === b.id ? "bg-brand-50/70" : ""
                      }`}
                    >
                      <td className="p-4 font-mono font-bold text-brand-950">{b.bookingCode}</td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-900 block">{b.customerName}</span>
                        <span className="text-[11px] text-slate-400">{b.customerPhone}</span>
                      </td>
                      <td className="p-4 font-medium text-slate-800">{b.vehicle?.name || "-"}</td>
                      <td className="p-4 text-slate-500">{formatDateTime(b.pickupAt)}</td>
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
                        <button
                          type="button"
                          className="px-3 py-1 rounded-lg border border-slate-200 text-brand-900 font-semibold hover:bg-white"
                        >
                          Pilih
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Tidak ada data pemesanan yang sesuai kriteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Booking Detail Panel */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          {selectedBooking ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Detail Pemesanan</span>
                  <h2 className="text-xl font-mono font-bold text-brand-950">{selectedBooking.bookingCode}</h2>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedBooking.status === "PENDING"
                      ? "bg-amber-100 text-amber-800"
                      : selectedBooking.status === "CONFIRMED"
                      ? "bg-blue-100 text-blue-800"
                      : selectedBooking.status === "IN_PROGRESS"
                      ? "bg-emerald-100 text-emerald-800"
                      : selectedBooking.status === "COMPLETED"
                      ? "bg-slate-100 text-slate-700"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {selectedBooking.status}
                </span>
              </div>

              {actionError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Customer Info & WA link */}
              <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl">
                <div className="font-bold text-sm text-brand-950 mb-1">{selectedBooking.customerName}</div>
                <div>Telepon / WA: <strong>{selectedBooking.customerPhone}</strong></div>
                {selectedBooking.customerEmail && <div>Email: {selectedBooking.customerEmail}</div>}
                <div>Lokasi Jemput: {selectedBooking.pickupLocation}</div>
                {selectedBooking.returnLocation && <div>Lokasi Kembali: {selectedBooking.returnLocation}</div>}
                {selectedBooking.customerNote && (
                  <div className="pt-2 border-t border-slate-200 text-slate-600 italic">
                    "{selectedBooking.customerNote}"
                  </div>
                )}

                <div className="pt-2">
                  <a
                    href={buildWhatsAppLink(
                      selectedBooking.customerPhone,
                      `Halo Bapak/Ibu ${selectedBooking.customerName}, kami dari Admin TJ Rentcar mengenai pemesanan unit ${selectedBooking.vehicle?.name} (Kode: ${selectedBooking.bookingCode})...`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat WhatsApp Pelanggan</span>
                  </a>
                </div>
              </div>

              {/* Schedule and Pricing Info */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Unit Kendaraan:</span>
                  <strong className="text-slate-900">{selectedBooking.vehicle?.name}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Layanan:</span>
                  <span className="text-slate-800">
                    {selectedBooking.serviceType === "WITH_DRIVER" ? "Dengan Sopir" : "Lepas Kunci"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Jadwal Mulai:</span>
                  <span className="text-slate-800">{formatDateTime(selectedBooking.pickupAt)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Jadwal Selesai:</span>
                  <span className="text-slate-800">{formatDateTime(selectedBooking.returnAt)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Durasi Hitung:</span>
                  <span className="text-slate-800">{selectedBooking.durationUnits} {selectedBooking.billingUnit}</span>
                </div>
                <div className="flex justify-between py-2 text-sm font-extrabold text-brand-950">
                  <span>Estimasi Biaya:</span>
                  <span>{formatRupiah(selectedBooking.estimatedTotal)}</span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Aksi Status Booking
                </span>

                {selectedBooking.status === "PENDING" && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleStatusChange("CONFIRMED")}
                      className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
                    >
                      Konfirmasi (Setuju)
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleStatusChange("REJECTED")}
                      className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors disabled:opacity-50"
                    >
                      Tolak Booking
                    </button>
                  </div>
                )}

                {selectedBooking.status === "CONFIRMED" && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleStatusChange("IN_PROGRESS")}
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
                    >
                      Mulai Rental (Jalan)
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleStatusChange("CANCELLED")}
                      className="py-2.5 px-3 rounded-xl bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs transition-colors disabled:opacity-50"
                    >
                      Batalkan
                    </button>
                  </div>
                )}

                {selectedBooking.status === "IN_PROGRESS" && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange("COMPLETED")}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    Rental Selesai (Unit Kembali)
                  </button>
                )}
              </div>

              {/* Internal Admin Note */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Catatan Internal Admin (Privat)
                </span>
                <textarea
                  rows={3}
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="Catatan khusus, nomor sopir yang ditugaskan, dll..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-900"
                ></textarea>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleSaveNote}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold"
                >
                  Simpan Catatan
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Pilih salah satu baris booking pada tabel untuk melihat detail dan mengubah status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
