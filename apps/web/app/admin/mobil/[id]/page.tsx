"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Star,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  DollarSign,
  Image as ImageIcon,
} from "lucide-react";
import { api, ApiClientError } from "@/lib/api-client";
import { formatRupiah } from "@/lib/formatters";
import { getAssetUrl } from "@/lib/asset-url";
import { ServiceType, BillingUnit } from "@/types";

export default function EditVehiclePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const vehicleId = params.id;

  const [vehicle, setVehicle] = useState<any | null>(null);
  const [rates, setRates] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [transmission, setTransmission] = useState("");
  const [seats, setSeats] = useState<number>(7);
  const [year, setYear] = useState<number>(2024);
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  // New rate form
  const [rateServiceType, setRateServiceType] = useState<ServiceType>("WITH_DRIVER");
  const [rateBillingUnit, setRateBillingUnit] = useState<BillingUnit>("DAILY");
  const [rateAmount, setRateAmount] = useState<number>(500000);
  const [rateSubmitting, setRateSubmitting] = useState(false);

  // Upload photo
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoSubmitting, setPhotoSubmitting] = useState(false);

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getAdminVehicleById(vehicleId),
      api.getVehicleRates(vehicleId),
      api.getAdminServices(),
    ])
      .then(([vData, rData, sData]) => {
        setVehicle(vData);
        setRates(rData);
        setServices(sData);

        setName(vData.name);
        setSlug(vData.slug);
        setCategory(vData.category);
        setTransmission(vData.transmission || "AUTOMATIC");
        setSeats(vData.seats || 7);
        setYear(vData.year || 2024);
        setDescription(vData.description || "");
        setIsActive(vData.isActive);
      })
      .catch((err) => {
        setFeedbackMsg({ type: "error", text: "Gagal memuat data kendaraan." });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [vehicleId]);

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    try {
      await api.updateAdminVehicle(vehicleId, {
        name,
        slug,
        category,
        transmission,
        seats: Number(seats),
        year: Number(year),
        description,
        isActive,
      });
      setFeedbackMsg({ type: "success", text: "Spesifikasi kendaraan berhasil diperbarui." });
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Gagal memperbarui kendaraan." });
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setPhotoSubmitting(true);
    setFeedbackMsg(null);

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("altText", `Foto ${name} armada TJ Rentcar`);

    try {
      await api.uploadVehicleImage(vehicleId, formData);
      setSelectedFile(null);
      setFeedbackMsg({ type: "success", text: "Foto kendaraan berhasil diunggah." });
      loadData();
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Gagal mengunggah foto." });
    } finally {
      setPhotoSubmitting(false);
    }
  };

  const handleSetPrimaryPhoto = async (imageId: string) => {
    try {
      await api.setPrimaryVehicleImage(vehicleId, imageId);
      loadData();
    } catch {}
  };

  const handleDeletePhoto = async (imageId: string) => {
    if (!confirm("Hapus foto ini?")) return;
    try {
      await api.deleteVehicleImage(vehicleId, imageId);
      loadData();
    } catch {}
  };

  const handleAddRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setRateSubmitting(true);
    setFeedbackMsg(null);

    try {
      await api.createVehicleRate(vehicleId, {
        serviceType: rateServiceType,
        billingUnit: rateBillingUnit,
        amount: Number(rateAmount),
      });
      setFeedbackMsg({ type: "success", text: "Tarif berhasil ditambahkan." });
      loadData();
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Gagal menambahkan tarif." });
    } finally {
      setRateSubmitting(false);
    }
  };

  const handleDeleteRate = async (rateId: string) => {
    if (!confirm("Hapus tarif ini?")) return;
    try {
      await api.deleteVehicleRate(vehicleId, rateId);
      loadData();
    } catch {}
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-900" />
        <span>Memuat detail kendaraan...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Link
        href="/admin/mobil"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Kembali ke Daftar Mobil</span>
      </Link>

      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-bold text-gold-600 uppercase tracking-widest block mb-1">
            Edit Armada
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight">
            {vehicle?.name}
          </h1>
        </div>

        <Link
          href={`/mobil/${vehicle?.slug}`}
          target="_blank"
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-brand-900 hover:bg-slate-50 text-xs font-semibold"
        >
          Lihat Halaman Publik ↗
        </Link>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-start space-x-2.5 ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {feedbackMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* 1. KELOLA FOTO KENDARAAN */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 font-bold text-base text-brand-950">
          <ImageIcon className="w-5 h-5 text-gold-500" />
          <span>Foto Galeri & Foto Utama</span>
        </div>

        {/* Existing Photos Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {vehicle?.images && vehicle.images.length > 0 ? (
            vehicle.images.map((img: any) => (
              <div
                key={img.id}
                className={`rounded-2xl overflow-hidden border relative aspect-[4/3] bg-slate-100 group ${
                  img.isPrimary ? "border-gold-500 ring-2 ring-gold-400" : "border-slate-200"
                }`}
              >
                <img src={getAssetUrl(img.url)} alt={img.altText || vehicle.name} className="w-full h-full object-cover" />

                {img.isPrimary && (
                  <div className="absolute top-2 left-2 bg-gold-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                    Foto Utama
                  </div>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  {!img.isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryPhoto(img.id)}
                      className="p-1.5 bg-white text-slate-800 rounded-lg text-xs font-semibold hover:bg-gold-50"
                      title="Jadikan Foto Utama"
                    >
                      <Star className="w-4 h-4 text-gold-500" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(img.id)}
                    className="p-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
                    title="Hapus Foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              Belum ada foto armada. Unggah foto di bawah.
            </div>
          )}
        </div>

        {/* Upload Form */}
        <form onSubmit={handleUploadPhoto} className="flex flex-col sm:flex-row items-center gap-3 pt-3">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="w-full sm:w-auto text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-900 hover:file:bg-brand-100"
          />
          <button
            type="submit"
            disabled={!selectedFile || photoSubmitting}
            className="px-4 py-2 rounded-xl bg-brand-900 text-white text-xs font-bold hover:bg-brand-800 disabled:opacity-50"
          >
            {photoSubmitting ? "Mengunggah..." : "Unggah Foto Baru"}
          </button>
        </form>
      </div>

      {/* 2. KELOLA TARIF SEWA */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 font-bold text-base text-brand-950">
          <DollarSign className="w-5 h-5 text-gold-500" />
          <span>Pengaturan Tarif Sewa</span>
        </div>

        {/* Rates Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Layanan</th>
                <th className="p-3">Durasi</th>
                <th className="p-3">Tarif (IDR)</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rates.length > 0 ? (
                rates.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">
                      {r.serviceType === "WITH_DRIVER" ? "Dengan Sopir" : "Lepas Kunci"}
                    </td>
                    <td className="p-3 text-slate-600">{r.billingUnit}</td>
                    <td className="p-3 font-bold text-brand-950">{formatRupiah(r.amount)}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteRate(r.id)}
                        className="text-rose-500 hover:text-rose-700 font-semibold text-xs"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400">
                    Belum ada tarif yang dikonfigurasi untuk unit ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Rate Form */}
        <form onSubmit={handleAddRate} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Layanan</label>
            <select
              value={rateServiceType}
              onChange={(e) => setRateServiceType(e.target.value as ServiceType)}
              className="w-full p-2 rounded-xl border border-slate-300 text-xs bg-white"
            >
              <option value="WITH_DRIVER">Dengan Sopir</option>
              <option value="SELF_DRIVE">Lepas Kunci</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Durasi</label>
            <select
              value={rateBillingUnit}
              onChange={(e) => setRateBillingUnit(e.target.value as BillingUnit)}
              className="w-full p-2 rounded-xl border border-slate-300 text-xs bg-white"
            >
              <option value="DAILY">Harian (DAILY)</option>
              <option value="WEEKLY">Mingguan (WEEKLY)</option>
              <option value="MONTHLY">Bulanan (MONTHLY)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Tarif (Rupiah)</label>
            <input
              type="number"
              value={rateAmount}
              onChange={(e) => setRateAmount(Number(e.target.value))}
              required
              min={0}
              step={10000}
              className="w-full p-2 rounded-xl border border-slate-300 text-xs bg-white"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={rateSubmitting}
              className="w-full py-2 px-3 rounded-xl bg-brand-900 text-white text-xs font-bold hover:bg-brand-800 disabled:opacity-50"
            >
              {rateSubmitting ? "Menambahkan..." : "Tambah Tarif"}
            </button>
          </div>
        </form>
      </div>

      {/* 3. EDIT SPESIFIKASI */}
      <form onSubmit={handleUpdateDetails} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-brand-950 pb-3 border-b border-slate-100">
          Edit Informasi Dasar & Status
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Nama Kendaraan</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Kategori</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Transmisi</label>
            <select
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
            >
              <option value="AUTOMATIC">Otomatis</option>
              <option value="MANUAL">Manual</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Deskripsi</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
          ></textarea>
        </div>

        <div>
          <label className="flex items-center space-x-2 text-xs text-slate-800 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded text-brand-900 focus:ring-brand-900"
            />
            <span>Tampilkan di Katalog Publik (Status Aktif)</span>
          </label>
        </div>

        <div className="pt-3">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold transition-all shadow-sm"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
