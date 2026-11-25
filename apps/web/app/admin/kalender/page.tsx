"use client";

import { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Wrench,
  Clock,
  Car,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { api, ApiClientError } from "@/lib/api-client";
import { formatDateTime } from "@/lib/formatters";

export default function AdminCalendarPage() {
  const [calendarData, setCalendarData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal / form for new maintenance block
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [blockVehicleId, setBlockVehicleId] = useState("");
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("MAINTENANCE");
  const [blockNote, setBlockNote] = useState("");
  const [blockError, setBlockError] = useState<string | null>(null);
  const [blockSubmitting, setBlockSubmitting] = useState(false);

  const fetchCalendar = () => {
    setLoading(true);
    api.getCalendarData()
      .then((data) => {
        setCalendarData(data);
        if (data.vehicles && data.vehicles.length > 0 && !blockVehicleId) {
          setBlockVehicleId(data.vehicles[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlockError(null);
    setBlockSubmitting(true);

    try {
      await api.createVehicleBlock({
        vehicleId: blockVehicleId,
        startAt: new Date(blockStart).toISOString(),
        endAt: new Date(blockEnd).toISOString(),
        reason: blockReason,
        note: blockNote || null,
      });

      setShowAddBlock(false);
      setBlockStart("");
      setBlockEnd("");
      setBlockNote("");
      fetchCalendar();
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        setBlockError(err.message);
      } else {
        setBlockError("Gagal menambahkan jadwal blokir.");
      }
    } finally {
      setBlockSubmitting(false);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (!confirm("Hapus jadwal blokir ini?")) return;
    try {
      await api.deleteVehicleBlock(id);
      fetchCalendar();
    } catch {}
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight">
            Kalender Reservasi & Pemeliharaan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau jadwal armada terkonfirmasi dan kelola periode maintenance/servis unit.
          </p>
        </div>

        <button
          onClick={() => setShowAddBlock(!showAddBlock)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Blokir Maintenance</span>
        </button>
      </div>

      {/* Modal Add Block */}
      {showAddBlock && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md animate-fadeIn max-w-xl">
          <div className="flex items-center space-x-2 font-bold text-sm text-brand-950 mb-4 pb-3 border-b border-slate-100">
            <Wrench className="w-4 h-4 text-amber-500" />
            <span>Formulir Blokir Jadwal Kendaraan</span>
          </div>

          {blockError && (
            <div className="p-3.5 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{blockError}</span>
            </div>
          )}

          <form onSubmit={handleCreateBlock} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Pilih Kendaraan
              </label>
              <select
                value={blockVehicleId}
                onChange={(e) => setBlockVehicleId(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-brand-900"
              >
                {calendarData?.vehicles?.map((v: any) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.brand})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Mulai Blokir
                </label>
                <input
                  type="datetime-local"
                  value={blockStart}
                  onChange={(e) => setBlockStart(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-brand-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Selesai Blokir
                </label>
                <input
                  type="datetime-local"
                  value={blockEnd}
                  onChange={(e) => setBlockEnd(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-brand-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Alasan Blokir
                </label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-brand-900"
                >
                  <option value="MAINTENANCE">Perawatan Rutin / Servis</option>
                  <option value="INTERNAL_USE">Keperluan Operasional Internal</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Catatan Keterangan
                </label>
                <input
                  type="text"
                  value={blockNote}
                  onChange={(e) => setBlockNote(e.target.value)}
                  placeholder="Ganti oli, perbaikan rem, dll..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-brand-900"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddBlock(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={blockSubmitting}
                className="px-4 py-2 rounded-xl bg-brand-900 text-white text-xs font-bold hover:bg-brand-800 disabled:opacity-50"
              >
                {blockSubmitting ? "Menyimpan..." : "Simpan Blokir"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid: Bookings Active & Maintenance Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Confirmed / Active Bookings */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 font-bold text-sm text-brand-950">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Jadwal Booking Terkonfirmasi & Berjalan</span>
          </div>

          <div className="space-y-3">
            {calendarData?.confirmedBookings && calendarData.confirmedBookings.length > 0 ? (
              calendarData.confirmedBookings.map((b: any) => (
                <div key={b.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between items-start font-bold">
                    <span className="text-brand-950">{b.vehicle?.name}</span>
                    <span className="font-mono text-blue-700">{b.bookingCode}</span>
                  </div>
                  <div className="text-slate-600">Penyewa: <strong>{b.customerName}</strong></div>
                  <div className="text-slate-500">
                    Jadwal: {formatDateTime(b.pickupAt)} s/d {formatDateTime(b.returnAt)}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Tidak ada jadwal booking aktif pada rentang ini.
              </div>
            )}
          </div>
        </div>

        {/* Maintenance Blocks */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 font-bold text-sm text-brand-950">
            <Wrench className="w-4 h-4 text-amber-600" />
            <span>Jadwal Pemeliharaan (Maintenance Block)</span>
          </div>

          <div className="space-y-3">
            {calendarData?.vehicleBlocks && calendarData.vehicleBlocks.length > 0 ? (
              calendarData.vehicleBlocks.map((blk: any) => (
                <div key={blk.id} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs space-y-1 relative">
                  <div className="flex justify-between items-start font-bold">
                    <span className="text-amber-950">{blk.vehicle?.name}</span>
                    <button
                      onClick={() => handleDeleteBlock(blk.id)}
                      className="text-rose-600 hover:text-rose-800 p-1"
                      title="Hapus blokir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-amber-900 font-semibold">{blk.reason} {blk.note ? `— ${blk.note}` : ""}</div>
                  <div className="text-slate-500">
                    Periode: {formatDateTime(blk.startAt)} s/d {formatDateTime(blk.endAt)}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Tidak ada unit kendaraan yang sedang dalam perbaikan.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
