"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Car, Plus, Edit, Trash2, CheckCircle2, XCircle, ArrowUpRight } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatRupiah } from "@/lib/formatters";
import { getAssetUrl } from "@/lib/asset-url";

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = () => {
    setLoading(true);
    api.getAdminVehicles()
      .then((data) => setVehicles(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus atau nonaktifkan kendaraan ${name}?`)) return;
    try {
      await api.deleteAdminVehicle(id);
      fetchVehicles();
    } catch {}
  };

  const handleToggleActive = async (v: any) => {
    try {
      await api.updateAdminVehicle(v.id, { isActive: !v.isActive });
      fetchVehicles();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight">
            Manajemen Armada Mobil
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola daftar unit kendaraan, spesifikasi, foto, dan tarif rental.
          </p>
        </div>

        <Link
          href="/admin/mobil/tambah"
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kendaraan Baru</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-4">Foto</th>
                <th className="p-4">Nama & Brand</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Transmisi & Kursi</th>
                <th className="p-4">Tarif Aktif</th>
                <th className="p-4">Status Katalog</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Memuat data armada...
                  </td>
                </tr>
              ) : vehicles.length > 0 ? (
                vehicles.map((v) => {
                  const primaryImg = v.images?.find((i: any) => i.isPrimary) || v.images?.[0];
                  return (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="w-14 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                          {primaryImg ? (
                            <img src={getAssetUrl(primaryImg.url)} alt={v.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Car className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-brand-950 block">{v.name}</span>
                        <span className="text-[11px] text-slate-400">{v.brand} {v.model} ({v.year || "-"})</span>
                      </td>
                      <td className="p-4">{v.category}</td>
                      <td className="p-4">
                        {v.transmission === "AUTOMATIC" ? "Matic" : v.transmission === "MANUAL" ? "Manual" : "-"} • {v.seats ? `${v.seats} Kursi` : "-"}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-900 block">
                          {v.rates?.length > 0 ? `${v.rates.length} Jenis Tarif` : "Belum diatur"}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleActive(v)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            v.isActive
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {v.isActive ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                          <span>{v.isActive ? "Aktif" : "Nonaktif"}</span>
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Link
                          href={`/mobil/${v.slug}`}
                          target="_blank"
                          className="p-1.5 inline-block text-slate-400 hover:text-brand-900"
                          title="Lihat halaman publik"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/mobil/${v.id}`}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-brand-900 font-semibold hover:bg-slate-100 text-xs"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(v.id, v.name)}
                          className="p-1.5 text-rose-500 hover:text-rose-700"
                          title="Hapus unit"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Belum ada kendaraan. Silakan klik "Tambah Kendaraan Baru".
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
