"use client";

import { Search, RotateCcw } from "lucide-react";

interface VehicleFilterProps {
  search: string;
  onSearchChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
  transmission: string;
  onTransmissionChange: (val: string) => void;
  serviceType: string;
  onServiceTypeChange: (val: string) => void;
  sort: string;
  onSortChange: (val: string) => void;
  onReset: () => void;
}

export function VehicleFilter({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  transmission,
  onTransmissionChange,
  serviceType,
  onServiceTypeChange,
  sort,
  onSortChange,
  onReset,
}: VehicleFilterProps) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-brand-200 shadow-sm mb-8 space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-brand-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama mobil atau merek (contoh: Avanza, Innova, Toyota)..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-200 bg-brand-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-brand-950 text-sm text-brand-950 placeholder:text-brand-400 transition-colors"
        />
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-1">
        {/* Kategori */}
        <div>
          <label className="text-[11px] font-semibold text-brand-600 block mb-1 uppercase tracking-wider">
            Tipe Mobil
          </label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-brand-200 bg-brand-50/50 focus:bg-white text-xs sm:text-sm text-brand-900 focus:outline-none focus:border-brand-950"
          >
            <option value="">Semua Tipe</option>
            <option value="MPV">MPV</option>
            <option value="Medium MPV">Medium MPV</option>
            <option value="SUV">SUV</option>
            <option value="Sedan">Sedan</option>
            <option value="Luxury">Luxury / Mewah</option>
          </select>
        </div>

        {/* Transmisi */}
        <div>
          <label className="text-[11px] font-semibold text-brand-600 block mb-1 uppercase tracking-wider">
            Transmisi
          </label>
          <select
            value={transmission}
            onChange={(e) => onTransmissionChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-brand-200 bg-brand-50/50 focus:bg-white text-xs sm:text-sm text-brand-900 focus:outline-none focus:border-brand-950"
          >
            <option value="">Semua Transmisi</option>
            <option value="AUTOMATIC">Matic (Otomatis)</option>
            <option value="MANUAL">Manual</option>
          </select>
        </div>

        {/* Layanan */}
        <div>
          <label className="text-[11px] font-semibold text-brand-600 block mb-1 uppercase tracking-wider">
            Layanan
          </label>
          <select
            value={serviceType}
            onChange={(e) => onServiceTypeChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-brand-200 bg-brand-50/50 focus:bg-white text-xs sm:text-sm text-brand-900 focus:outline-none focus:border-brand-950"
          >
            <option value="">Semua Layanan</option>
            <option value="WITH_DRIVER">Dengan Sopir</option>
            <option value="SELF_DRIVE">Lepas Kunci</option>
          </select>
        </div>

        {/* Urutan */}
        <div>
          <label className="text-[11px] font-semibold text-brand-600 block mb-1 uppercase tracking-wider">
            Urutkan
          </label>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-brand-200 bg-brand-50/50 focus:bg-white text-xs sm:text-sm text-brand-900 focus:outline-none focus:border-brand-950"
          >
            <option value="newest">Terbaru</option>
            <option value="price_asc">Harga Terendah</option>
            <option value="price_desc">Harga Tertinggi</option>
            <option value="name_asc">Nama (A - Z)</option>
          </select>
        </div>

        {/* Reset */}
        <div className="flex items-end col-span-2 md:col-span-1">
          <button
            type="button"
            onClick={onReset}
            className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border border-brand-200 text-brand-700 hover:text-brand-950 hover:bg-brand-50 text-xs sm:text-sm font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-brand-500" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
