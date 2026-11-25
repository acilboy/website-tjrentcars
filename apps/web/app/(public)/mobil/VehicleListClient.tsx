"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { VehicleFilter } from "@/components/vehicles/VehicleFilter";
import { Vehicle } from "@/types";
import { SearchX } from "lucide-react";

interface VehicleListClientProps {
  initialVehicles: Vehicle[];
}

export function VehicleListClient({ initialVehicles }: VehicleListClientProps) {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [category, setCategory] = useState(() => searchParams.get("category") || "");
  const [transmission, setTransmission] = useState(() => searchParams.get("transmission") || "");
  const [serviceType, setServiceType] = useState(() => searchParams.get("serviceType") || "");
  const [sort, setSort] = useState(() => searchParams.get("sort") || "newest");

  useEffect(() => {
    const qCategory = searchParams.get("category");
    const qTrans = searchParams.get("transmission");
    const qService = searchParams.get("serviceType");
    const qSearch = searchParams.get("search");
    if (qCategory !== null) setCategory(qCategory);
    if (qTrans !== null) setTransmission(qTrans);
    if (qService !== null) setServiceType(qService);
    if (qSearch !== null) setSearch(qSearch);
  }, [searchParams]);

  const filteredVehicles = useMemo(() => {
    return initialVehicles
      .filter((v) => {
        if (search) {
          const q = search.toLowerCase();
          const matchName = v.name.toLowerCase().includes(q);
          const matchBrand = v.brand.toLowerCase().includes(q);
          const matchModel = v.model.toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchModel) return false;
        }

        if (category && v.category.toLowerCase() !== category.toLowerCase()) {
          return false;
        }

        if (transmission && v.transmission !== transmission) {
          return false;
        }

        if (serviceType) {
          const hasMatchingRate = v.rates?.some((r) => r.serviceType === serviceType);
          const serviceSlug = serviceType === "WITH_DRIVER" ? "dengan-sopir" : "lepas-kunci";
          const hasMatchingService = v.services?.some((s) => s.slug === serviceSlug);
          if (!hasMatchingRate && !hasMatchingService) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sort === "price_asc") {
          return (a.minRate ?? Infinity) - (b.minRate ?? Infinity);
        }
        if (sort === "price_desc") {
          return (b.minRate ?? 0) - (a.minRate ?? 0);
        }
        if (sort === "name_asc") {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [initialVehicles, search, category, transmission, serviceType, sort]);

  const handleReset = () => {
    setSearch("");
    setCategory("");
    setTransmission("");
    setServiceType("");
    setSort("newest");
  };

  return (
    <div>
      <VehicleFilter
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        transmission={transmission}
        onTransmissionChange={setTransmission}
        serviceType={serviceType}
        onServiceTypeChange={setServiceType}
        sort={sort}
        onSortChange={setSort}
        onReset={handleReset}
      />

      <div className="flex justify-between items-center mb-6 text-xs text-brand-600 tabular-nums">
        <span>
          Menampilkan <strong className="text-brand-950">{filteredVehicles.length}</strong> unit armada
        </span>
      </div>

      {filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-12 text-center my-8">
          <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-4">
            <SearchX className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-brand-950">
            Tidak ada kendaraan yang sesuai filter
          </h3>
          <p className="text-xs text-brand-600 max-w-md mx-auto mt-1.5 mb-5">
            Coba ubah kata kunci pencarian atau bersihkan filter untuk melihat seluruh armada yang tersedia.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 bg-brand-950 text-white rounded-xl text-xs font-bold hover:bg-brand-800 transition-colors"
          >
            Bersihkan Filter
          </button>
        </div>
      )}
    </div>
  );
}
