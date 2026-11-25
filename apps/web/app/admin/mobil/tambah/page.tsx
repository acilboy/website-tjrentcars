"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Car, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { api, ApiClientError } from "@/lib/api-client";

export default function AddVehiclePage() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [category, setCategory] = useState("MPV");
  const [transmission, setTransmission] = useState("AUTOMATIC");
  const [seats, setSeats] = useState<number>(7);
  const [doors, setDoors] = useState<number>(5);
  const [fuelType, setFuelType] = useState("Bensin");
  const [luggageCapacity, setLuggageCapacity] = useState("3 Koper");
  const [description, setDescription] = useState("");
  const [featuresInput, setFeaturesInput] = useState("AC Double Blower, Audio Touchscreen, Sensor Parkir");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    api.getAdminServices()
      .then((data) => {
        setServices(data);
        setSelectedServiceIds(data.map((s: any) => s.id)); // default all selected
      })
      .catch(() => {});
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  const handleServiceToggle = (id: string) => {
    if (selectedServiceIds.includes(id)) {
      setSelectedServiceIds(selectedServiceIds.filter((sId) => sId !== id));
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const featuresArray = featuresInput
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        name,
        slug,
        brand,
        model,
        year: year ? Number(year) : null,
        category,
        transmission,
        seats: seats ? Number(seats) : null,
        doors: doors ? Number(doors) : null,
        fuelType,
        luggageCapacity,
        description,
        features: featuresArray,
        serviceIds: selectedServiceIds,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        isActive: true,
      };

      const created = await api.createAdminVehicle(payload);
      router.push(`/admin/mobil/${created.id}`);
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Gagal menyimpan data kendaraan.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/admin/mobil"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Kembali ke Daftar Mobil</span>
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold text-brand-950 tracking-tight">
          Tambah Armada Kendaraan Baru
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Lengkapi data spesifikasi kendaraan. Foto dan tarif dapat diatur setelah unit tersimpan.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-brand-950 pb-3 border-b border-slate-100">
            Identitas Utama
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nama Display Kendaraan *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                placeholder="Contoh: Toyota Avanza 1.5 G"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Slug URL *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                placeholder="toyota-avanza-1-5-g"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:border-brand-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Merek (Brand) *
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
                placeholder="Toyota / Mitsubishi / Honda"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Model Kendaraan *
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
                placeholder="Avanza / Innova Zenix"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-900"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-brand-950 pb-3 border-b border-slate-100">
            Spesifikasi Teknis
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-900"
              >
                <option value="MPV">MPV</option>
                <option value="Medium MPV">Medium MPV</option>
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Luxury">Luxury</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Transmisi</label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-900"
              >
                <option value="AUTOMATIC">Otomatis (Matic)</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Jumlah Kursi</label>
              <input
                type="number"
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                min={2}
                max={50}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Tahun Unit</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={2000}
                max={2035}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Bahan Bakar</label>
              <input
                type="text"
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Kapasitas Bagasi</label>
              <input
                type="text"
                value={luggageCapacity}
                onChange={(e) => setLuggageCapacity(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-900"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Fitur (Pisahkan dengan koma)
              </label>
              <input
                type="text"
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-900"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Deskripsi Unit</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan kondisi dan kelebihan kendaraan ini..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-900"
            ></textarea>
          </div>
        </div>

        {/* Layanan yang Didukung */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-brand-950 pb-3 border-b border-slate-100">
            Pilihan Layanan yang Dapat Digunakan Mobil Ini
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((s) => (
              <label key={s.id} className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedServiceIds.includes(s.id)}
                  onChange={() => handleServiceToggle(s.id)}
                  className="rounded text-brand-900 focus:ring-brand-900"
                />
                <span className="font-medium">{s.title}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Link
            href="/admin/mobil"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? "Menyimpan Data..." : "Simpan & Lanjutkan ke Foto/Tarif"}
          </button>
        </div>
      </form>
    </div>
  );
}
