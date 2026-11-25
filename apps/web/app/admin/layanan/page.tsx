"use client";

import { useEffect, useState } from "react";
import { Layers, Plus, Edit, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { api, ApiClientError } from "@/lib/api-client";
import { ServiceItem } from "@/types";

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Add modal
  const [editingService, setEditingService] = useState<any | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [desc, setDesc] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchServices = () => {
    setLoading(true);
    api.getAdminServices()
      .then((data) => setServices(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenEdit = (s: any) => {
    setEditingService(s);
    setTitle(s.title);
    setSlug(s.slug);
    setShortDesc(s.shortDescription || "");
    setDesc(s.description || "");
    setFormError(null);
  };

  const handleOpenAdd = () => {
    setEditingService({ id: "NEW" });
    setTitle("");
    setSlug("");
    setShortDesc("");
    setDesc("");
    setFormError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      if (editingService.id === "NEW") {
        await api.createAdminService({
          title,
          slug,
          shortDescription: shortDesc || null,
          description: desc || null,
          isActive: true,
        });
      } else {
        await api.updateAdminService(editingService.id, {
          title,
          slug,
          shortDescription: shortDesc || null,
          description: desc || null,
        });
      }
      setEditingService(null);
      fetchServices();
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        setFormError(err.message);
      } else {
        setFormError("Gagal menyimpan data layanan.");
      }
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight">
            Manajemen Layanan Rental
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola judul, deskripsi, dan halaman informasi setiap layanan rental.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Layanan Baru</span>
        </button>
      </div>

      {editingService && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md max-w-2xl space-y-4">
          <h2 className="text-base font-bold text-brand-950 pb-2 border-b border-slate-100">
            {editingService.id === "NEW" ? "Tambah Layanan Baru" : `Edit Layanan: ${editingService.title}`}
          </h2>

          {formError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Judul Layanan *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (editingService.id === "NEW" && !slug) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                    }
                  }}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Slug URL *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Deskripsi Singkat</label>
              <input
                type="text"
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Ringkasan 1-2 kalimat untuk kartu beranda"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Deskripsi & Ketentuan Lengkap</label>
              <textarea
                rows={5}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-5 py-2 rounded-xl bg-brand-900 text-white text-xs font-bold hover:bg-brand-800 disabled:opacity-50"
              >
                {formLoading ? "Menyimpan..." : "Simpan Layanan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Services Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-4">Layanan</th>
                <th className="p-4">Slug URL</th>
                <th className="p-4">Ringkasan</th>
                <th className="p-4">Armada Terhubung</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Memuat layanan...
                  </td>
                </tr>
              ) : services.length > 0 ? (
                services.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-brand-950">{s.title}</td>
                    <td className="p-4 font-mono text-slate-500">{s.slug}</td>
                    <td className="p-4 max-w-xs truncate text-slate-500">{s.shortDescription || "-"}</td>
                    <td className="p-4">{s._count?.vehicles || 0} unit</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-brand-900 font-semibold hover:bg-slate-100"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Belum ada data layanan.
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
