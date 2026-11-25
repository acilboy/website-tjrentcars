"use client";

import { useEffect, useState } from "react";
import { Settings, Save, CheckCircle2, AlertCircle, Loader2, ShieldCheck, MapPin, Phone, Mail, Clock } from "lucide-react";
import { api, ApiClientError } from "@/lib/api-client";
import { SiteSettings } from "@/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [businessName, setBusinessName] = useState("");
  const [tagline, setTagline] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [businessHours, setBusinessHours] = useState("");
  const [publicAddress, setPublicAddress] = useState("");
  const [showPublicAddress, setShowPublicAddress] = useState(false);
  const [serviceAreasInput, setServiceAreasInput] = useState("");
  const [airportRoutesInput, setAirportRoutesInput] = useState("");
  const [outOfTownRoutesInput, setOutOfTownRoutesInput] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const fetchSettings = () => {
    setLoading(true);
    api.getAdminSettings()
      .then((data) => {
        setSettings(data);
        setBusinessName(data.businessName || "TJ Rentcar");
        setTagline(data.tagline || "");
        setWhatsappNumber(data.whatsappNumber || "");
        setPhoneNumber(data.phoneNumber || "");
        setEmail(data.email || "");
        setBusinessHours(data.businessHours || "Senin - Minggu: 07:00 - 22:00 WIB");
        setPublicAddress(data.publicAddress || "");
        setShowPublicAddress(Boolean(data.showPublicAddress));
        setServiceAreasInput(Array.isArray(data.serviceAreas) ? data.serviceAreas.join(", ") : "");
        setAirportRoutesInput(Array.isArray(data.airportRoutes) ? data.airportRoutes.join(", ") : "");
        setOutOfTownRoutesInput(Array.isArray(data.outOfTownRoutes) ? data.outOfTownRoutes.join(", ") : "");
        setMetaTitle(data.metaTitle || "Rental Mobil Jakarta | TJ Rentcar");
        setMetaDescription(data.metaDescription || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const serviceAreas = serviceAreasInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const airportRoutes = airportRoutesInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const outOfTownRoutes = outOfTownRoutesInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        businessName,
        tagline,
        whatsappNumber: whatsappNumber || null,
        phoneNumber: phoneNumber || null,
        email: email || null,
        businessHours,
        publicAddress: publicAddress || null,
        showPublicAddress,
        serviceAreas,
        airportRoutes,
        outOfTownRoutes,
        metaTitle,
        metaDescription,
      };

      await api.updateAdminSettings(payload);
      setFeedback({ type: "success", text: "Pengaturan identitas bisnis berhasil diperbarui dan diterapkan ke seluruh website." });
      fetchSettings();
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        setFeedback({ type: "error", text: err.message });
      } else {
        setFeedback({ type: "error", text: "Gagal menyimpan pengaturan." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-900" />
        <span>Memuat pengaturan bisnis...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight">
          Pengaturan Bisnis & Identitas TJ Rentcar
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Semua informasi bisnis yang diubah di sini langsung tersinkronisasi ke tampilan publik, formulir pemesanan, dan schema SEO.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-start space-x-2.5 ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. BRAND & KONTAK */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 font-bold text-base text-brand-950">
            <Phone className="w-5 h-5 text-gold-500" />
            <span>Identitas & Kanal Kontak Resmi</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Nama Brand Bisnis</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Tagline Promosi</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Layanan Rental Mobil Profesional di Jakarta"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nomor WhatsApp Resmi * (Format: 628xxxxxxxxxx)
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="6281234567890"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono font-semibold"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Digunakan untuk tombol click-to-chat WhatsApp di seluruh website.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Nomor Telepon Kantor Alternatif</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="021-xxxxxxx"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Email Resmi</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@tjrentcar.com"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Jam Operasional</label>
              <input
                type="text"
                value={businessHours}
                onChange={(e) => setBusinessHours(e.target.value)}
                placeholder="Senin - Minggu: 07:00 - 22:00 WIB"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* 2. AREA & ALAMAT */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 font-bold text-base text-brand-950">
            <MapPin className="w-5 h-5 text-gold-500" />
            <span>Wilayah Operasional & Alamat Kantor</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Area Layanan di Jakarta (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={serviceAreasInput}
              onChange={(e) => setServiceAreasInput(e.target.value)}
              placeholder="Jakarta Pusat, Jakarta Selatan, Jakarta Barat, Jakarta Timur, Jakarta Utara"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Rute Bandara yang Dilayani (Pisahkan dengan koma)
              </label>
              <input
                type="text"
                value={airportRoutesInput}
                onChange={(e) => setAirportRoutesInput(e.target.value)}
                placeholder="Bandara Soekarno-Hatta (CGK), Bandara Halim Perdanakusuma (HLP)"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Rute Luar Kota yang Diterima (Pisahkan dengan koma)
              </label>
              <input
                type="text"
                value={outOfTownRoutesInput}
                onChange={(e) => setOutOfTownRoutesInput(e.target.value)}
                placeholder="Bandung, Bogor, Puncak, Cirebon, Semarang"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Alamat Fisik Kantor / Garasi</label>
            <textarea
              rows={2}
              value={publicAddress}
              onChange={(e) => setPublicAddress(e.target.value)}
              placeholder="Alamat kantor lengkap di Jakarta..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
            ></textarea>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-xs text-slate-800 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={showPublicAddress}
                onChange={(e) => setShowPublicAddress(e.target.checked)}
                className="rounded text-brand-900 focus:ring-brand-900"
              />
              <span>Tampilkan Alamat Kantor di Website & Skema LocalBusiness JSON-LD</span>
            </label>
            <span className="text-[10px] text-slate-400 block mt-0.5 ml-6">
              Jika TJ Rentcar adalah service-area business dan pelanggan tidak datang langsung ke kantor, biarkan opsi ini tidak dicentang.
            </span>
          </div>
        </div>

        {/* 3. SEO DEFAULTS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 font-bold text-base text-brand-950">
            <ShieldCheck className="w-5 h-5 text-gold-500" />
            <span>Pengaturan SEO Default Homepage</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Default Meta Title</label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Default Meta Description</label>
            <textarea
              rows={2}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-2xl bg-brand-900 hover:bg-brand-800 text-white font-extrabold text-sm transition-all shadow-md flex items-center space-x-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan Pengaturan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Seluruh Pengaturan Bisnis</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
