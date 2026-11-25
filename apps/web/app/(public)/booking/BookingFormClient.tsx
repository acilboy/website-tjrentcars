"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Car, Calendar, User, Phone, Mail, MapPin, FileText, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { api, ApiClientError } from "@/lib/api-client";
import { formatRupiah } from "@/lib/formatters";
import { trackBeginBooking, trackBookingSubmit } from "@/lib/analytics";
import type { FieldErrors } from "@/lib/validation";
import {
  LOCATION_MAX,
  LOCATION_MIN,
  NOTE_MAX,
  PHONE_HINT,
  mapApiFieldErrors,
  validateOptionalEmail,
  validateOptionalText,
  validatePersonName,
  validateRequiredText,
  validateWhatsAppNumber,
} from "@/lib/validation";
import { Vehicle, ServiceType, BillingUnit } from "@/types";

const CUSTOMER_FIELDS = [
  "customerName",
  "customerPhone",
  "customerEmail",
  "pickupLocation",
  "returnLocation",
  "customerNote",
] as const;

type CustomerField = (typeof CUSTOMER_FIELDS)[number];


interface Props {
  vehicles: Vehicle[];
  initialVehicleId?: string;
  initialPickupAt?: string;
  initialReturnAt?: string;
  initialServiceType?: string;
  initialBillingUnit?: string;
}

export function BookingFormClient({
  vehicles,
  initialVehicleId,
  initialPickupAt,
  initialReturnAt,
  initialServiceType,
  initialBillingUnit,
}: Props) {
  const router = useRouter();

  // Helper date defaults
  const formatInput = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const defaultPickup = initialPickupAt ? new Date(initialPickupAt) : new Date(Date.now() + 24 * 60 * 60 * 1000);
  const defaultReturn = initialReturnAt ? new Date(initialReturnAt) : new Date(Date.now() + 48 * 60 * 60 * 1000);

  const [vehicleId, setVehicleId] = useState(initialVehicleId || vehicles[0]?.id || "");
  const [serviceType, setServiceType] = useState<ServiceType>((initialServiceType as ServiceType) || "WITH_DRIVER");
  const [billingUnit, setBillingUnit] = useState<BillingUnit>((initialBillingUnit as BillingUnit) || "DAILY");
  const [pickupAt, setPickupAt] = useState(formatInput(defaultPickup));
  const [returnAt, setReturnAt] = useState(formatInput(defaultReturn));
  const [pickupLocation, setPickupLocation] = useState("");
  const [returnLocation, setReturnLocation] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Availability / Price state
  const [pricingInfo, setPricingInfo] = useState<any | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);

  // Form submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Inline field validation state
  const [errors, setErrors] = useState<FieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  const getFieldValue = (field: CustomerField): string => {
    switch (field) {
      case "customerName":
        return customerName;
      case "customerPhone":
        return customerPhone;
      case "customerEmail":
        return customerEmail;
      case "pickupLocation":
        return pickupLocation;
      case "returnLocation":
        return returnLocation;
      case "customerNote":
        return customerNote;
    }
  };

  const validateField = (field: CustomerField, value: string): string | null => {
    switch (field) {
      case "customerName":
        return validatePersonName(value);
      case "customerPhone":
        return validateWhatsAppNumber(value);
      case "customerEmail":
        return validateOptionalEmail(value);
      case "pickupLocation":
        return validateRequiredText(value, "Alamat penjemputan", LOCATION_MIN, LOCATION_MAX);
      case "returnLocation":
        return validateOptionalText(value, "Lokasi pengembalian", LOCATION_MAX);
      case "customerNote":
        return validateOptionalText(value, "Catatan tambahan", NOTE_MAX);
      default:
        return null;
    }
  };

  const collectErrors = (): FieldErrors => {
    const next: FieldErrors = {};
    for (const field of CUSTOMER_FIELDS) {
      const message = validateField(field, getFieldValue(field));
      if (message) next[field] = message;
    }
    return next;
  };

  const focusFirstError = (next: FieldErrors) => {
    const first = CUSTOMER_FIELDS.find((field) => next[field]);
    if (!first) return;
    const element = formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`);
    element?.focus();
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleBlur = (field: CustomerField) => {
    const message = validateField(field, getFieldValue(field));
    setErrors((prev) => ({ ...prev, [field]: message || "" }));
  };

  const handleFieldChange = (field: CustomerField, value: string) => {
    const setter: Record<CustomerField, (value: string) => void> = {
      customerName: setCustomerName,
      customerPhone: setCustomerPhone,
      customerEmail: setCustomerEmail,
      pickupLocation: setPickupLocation,
      returnLocation: setReturnLocation,
      customerNote: setCustomerNote,
    };
    setter[field](value);

    // Only re-validate fields that already show an error.
    if (errors[field]) {
      const message = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: message || "" }));
    }
  };

  const fieldClass = (field: CustomerField) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm text-brand-950 bg-brand-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-colors ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
        : "border-brand-200 focus:border-brand-950 focus:ring-gold-500/30"
    }`;

  // Selected vehicle object
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  // Check price estimate when schedule/vehicle/service changes
  useEffect(() => {
    if (!vehicleId || !pickupAt || !returnAt) return;

    const pDate = new Date(pickupAt);
    const rDate = new Date(returnAt);

    if (rDate <= pDate) {
      setPricingError("Tanggal pengembalian harus setelah tanggal penjemputan.");
      setPricingInfo(null);
      return;
    }

    setPricingLoading(true);
    setPricingError(null);

    api.checkAvailability(vehicleId, {
      pickupAt: pDate.toISOString(),
      returnAt: rDate.toISOString(),
      serviceType,
      billingUnit,
    })
      .then((res) => {
        setPricingInfo(res);
        if (!res.available) {
          setPricingError(res.conflictReason || "Unit tidak tersedia pada jadwal ini.");
        }
      })
      .catch((err) => {
        setPricingError(err.message || "Gagal menghitung tarif.");
      })
      .finally(() => {
        setPricingLoading(false);
      });
  }, [vehicleId, pickupAt, returnAt, serviceType, billingUnit]);

  // Track begin booking on mount
  useEffect(() => {
    if (vehicleId) {
      trackBeginBooking(vehicleId, serviceType);
    }
  }, [vehicleId, serviceType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const nextErrors = collectErrors();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitError("Periksa kembali data pemesan yang Anda isi.");
      focusFirstError(nextErrors);
      return;
    }
    setErrors({});

    if (!acceptedTerms) {
      setSubmitError("Anda harus menyetujui syarat & ketentuan serta kebijakan privasi.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        vehicleId,
        serviceType,
        billingUnit,
        pickupAt: new Date(pickupAt).toISOString(),
        returnAt: new Date(returnAt).toISOString(),
        pickupLocation,
        returnLocation: returnLocation || null,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        customerNote: customerNote || null,
        acceptedTerms: true,
      };

      const res = await api.createBooking(payload);

      // Track conversion in GA4 without PII
      trackBookingSubmit(serviceType, billingUnit, res.durationUnits || 1);

      // Redirect to success page
      const q = new URLSearchParams({
        code: res.bookingCode,
        vehicle: res.vehicleName,
        pickup: res.pickupAt,
        return: res.returnAt,
        total: res.estimatedTotal ? String(res.estimatedTotal) : "",
      });

      router.push(`/booking/berhasil?${q.toString()}`);
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        const fieldErrors = mapApiFieldErrors(err.details, [...CUSTOMER_FIELDS]);
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          focusFirstError(fieldErrors);
        }
        setSubmitError(err.message);
      } else {
        setSubmitError("Terjadi kesalahan saat mengirim booking. Silakan coba kembali.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-8">
      {submitError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* 1. KENDARAAN & PAKET */}
      <div className="bg-white rounded-2xl border border-brand-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-brand-100">
          <Car className="w-5 h-5 text-gold-600" />
          <h2 className="text-lg font-bold text-brand-950">1. Pilih Armada & Layanan</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="sm:col-span-3">
            <label className="text-xs font-semibold text-brand-700 block mb-2">
              Pilih Unit Kendaraan *
            </label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-brand-200 text-sm font-medium text-brand-950 bg-brand-50/50 focus:bg-white focus:outline-none focus:border-brand-950"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.brand} {v.category}) — {v.minRate ? formatRupiah(v.minRate) : "Harga hubungi admin"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-700 block mb-2">
              Pilihan Layanan *
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value as ServiceType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-200 text-sm text-brand-950 bg-brand-50/50 focus:bg-white focus:outline-none focus:border-brand-950"
            >
              <option value="WITH_DRIVER">Rental dengan Sopir</option>
              <option value="SELF_DRIVE">Rental Lepas Kunci</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-brand-700 block mb-2">
              Paket Durasi Sewa *
            </label>
            <select
              value={billingUnit}
              onChange={(e) => setBillingUnit(e.target.value as BillingUnit)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-200 text-sm text-brand-950 bg-brand-50/50 focus:bg-white focus:outline-none focus:border-brand-950"
            >
              <option value="DAILY">Sewa Harian (Dihitung per 24 Jam)</option>
              <option value="WEEKLY">Sewa Mingguan (Dihitung per 7 Hari)</option>
              <option value="MONTHLY">Sewa Bulanan (Dihitung per 30 Hari)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. JADWAL & LOKASI */}
      <div className="bg-white rounded-2xl border border-brand-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-brand-100">
          <Calendar className="w-5 h-5 text-gold-600" />
          <h2 className="text-lg font-bold text-brand-950">2. Jadwal & Lokasi Penjemputan</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-semibold text-brand-700 block mb-2">
              Tanggal & Waktu Penjemputan *
            </label>
            <input
              type="datetime-local"
              value={pickupAt}
              onChange={(e) => setPickupAt(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-brand-200 text-sm text-brand-950 bg-brand-50/50 focus:bg-white focus:outline-none focus:border-brand-950"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-700 block mb-2">
              Tanggal & Waktu Pengembalian *
            </label>
            <input
              type="datetime-local"
              value={returnAt}
              onChange={(e) => setReturnAt(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-brand-200 text-sm text-brand-950 bg-brand-50/50 focus:bg-white focus:outline-none focus:border-brand-950"
            />
          </div>

          <div>
            <label htmlFor="pickupLocation" className="text-xs font-semibold text-slate-700 block mb-2">
              Alamat / Titik Penjemputan di Jakarta *
            </label>
            <input
              id="pickupLocation"
              name="pickupLocation"
              type="text"
              value={pickupLocation}
              onChange={(e) => handleFieldChange("pickupLocation", e.target.value)}
              onBlur={() => handleBlur("pickupLocation")}
              required
              autoComplete="street-address"
              aria-invalid={Boolean(errors.pickupLocation)}
              aria-describedby={errors.pickupLocation ? "pickupLocation-error" : undefined}
              placeholder="Contoh: Hotel Mulia Senayan / Bandara Soekarno-Hatta Terminal 3"
              className={fieldClass("pickupLocation")}
            />
            {errors.pickupLocation && (
              <p id="pickupLocation-error" className="mt-1.5 text-[11px] font-medium text-red-600">
                {errors.pickupLocation}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="returnLocation" className="text-xs font-semibold text-slate-700 block mb-2">
              Lokasi Pengembalian (Opsional)
            </label>
            <input
              id="returnLocation"
              name="returnLocation"
              type="text"
              value={returnLocation}
              onChange={(e) => handleFieldChange("returnLocation", e.target.value)}
              onBlur={() => handleBlur("returnLocation")}
              autoComplete="off"
              aria-invalid={Boolean(errors.returnLocation)}
              aria-describedby={errors.returnLocation ? "returnLocation-error" : undefined}
              placeholder="Kosongkan jika sama dengan lokasi penjemputan"
              className={fieldClass("returnLocation")}
            />
            {errors.returnLocation && (
              <p id="returnLocation-error" className="mt-1.5 text-[11px] font-medium text-red-600">
                {errors.returnLocation}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. DATA PENYEWA */}
      <div className="bg-white rounded-2xl border border-brand-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-brand-100">
          <User className="w-5 h-5 text-gold-600" />
          <h2 className="text-lg font-bold text-brand-950">3. Data Kontak Pemesan</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="customerName" className="text-xs font-semibold text-slate-700 block mb-2">
              Nama Lengkap Pemesan *
            </label>
            <input
              id="customerName"
              name="customerName"
              type="text"
              value={customerName}
              onChange={(e) => handleFieldChange("customerName", e.target.value)}
              onBlur={() => handleBlur("customerName")}
              required
              autoComplete="name"
              inputMode="text"
              aria-invalid={Boolean(errors.customerName)}
              aria-describedby={errors.customerName ? "customerName-error" : undefined}
              placeholder="Sesuai KTP / Paspor"
              className={fieldClass("customerName")}
            />
            {errors.customerName && (
              <p id="customerName-error" className="mt-1.5 text-[11px] font-medium text-red-600">
                {errors.customerName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="customerPhone" className="text-xs font-semibold text-slate-700 block mb-2">
              Nomor WhatsApp Aktif *
            </label>
            <input
              id="customerPhone"
              name="customerPhone"
              type="tel"
              value={customerPhone}
              onChange={(e) => handleFieldChange("customerPhone", e.target.value)}
              onBlur={() => handleBlur("customerPhone")}
              required
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={Boolean(errors.customerPhone)}
              aria-describedby={errors.customerPhone ? "customerPhone-error" : "customerPhone-hint"}
              placeholder="Contoh: 0812345678"
              className={fieldClass("customerPhone")}
            />
            {errors.customerPhone ? (
              <p id="customerPhone-error" className="mt-1.5 text-[11px] font-medium text-red-600">
                {errors.customerPhone}
              </p>
            ) : (
              <span id="customerPhone-hint" className="text-[11px] text-slate-400 mt-1 block">
                {PHONE_HINT} Admin akan mengirimkan konfirmasi ketersediaan unit melalui nomor ini.
              </span>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="customerEmail" className="text-xs font-semibold text-slate-700 block mb-2">
              Email (Opsional)
            </label>
            <input
              id="customerEmail"
              name="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(e) => handleFieldChange("customerEmail", e.target.value)}
              onBlur={() => handleBlur("customerEmail")}
              autoComplete="email"
              inputMode="email"
              aria-invalid={Boolean(errors.customerEmail)}
              aria-describedby={errors.customerEmail ? "customerEmail-error" : undefined}
              placeholder="Untuk pengiriman invoice digital jika diperlukan"
              className={fieldClass("customerEmail")}
            />
            {errors.customerEmail && (
              <p id="customerEmail-error" className="mt-1.5 text-[11px] font-medium text-red-600">
                {errors.customerEmail}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="customerNote" className="text-xs font-semibold text-slate-700 block mb-2">
              Catatan Khusus / Rute Perjalanan (Opsional)
            </label>
            <textarea
              id="customerNote"
              name="customerNote"
              rows={3}
              value={customerNote}
              onChange={(e) => handleFieldChange("customerNote", e.target.value)}
              onBlur={() => handleBlur("customerNote")}
              aria-invalid={Boolean(errors.customerNote)}
              aria-describedby={errors.customerNote ? "customerNote-error" : undefined}
              placeholder="Tuliskan jika ada kebutuhan rute khusus, nomor penerbangan, atau permintaan tambahan..."
              className={fieldClass("customerNote")}
            ></textarea>
            {errors.customerNote && (
              <p id="customerNote-error" className="mt-1.5 text-[11px] font-medium text-red-600">
                {errors.customerNote}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 4. RINGKASAN BIAYA & PERSETUJUAN */}
      <div className="bg-brand-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border-t-2 border-gold-500 space-y-6">
        <h2 className="text-lg font-bold text-white pb-3 border-b border-brand-800">
          Ringkasan Pemesanan
        </h2>

        {pricingLoading ? (
          <div className="flex items-center space-x-2 text-xs text-brand-300 py-3">
            <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
            <span>Mengkalkulasi durasi dan tarif server...</span>
          </div>
        ) : pricingInfo ? (
          <div className="space-y-3 text-xs sm:text-sm text-brand-300 tabular-nums">
            <div className="flex justify-between py-1.5 border-b border-brand-800">
              <span>Unit Armada:</span>
              <strong className="text-white">{selectedVehicle?.name}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-brand-800">
              <span>Layanan:</span>
              <span className="text-white">
                {serviceType === "WITH_DRIVER" ? "Rental dengan Sopir" : "Rental Lepas Kunci"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-brand-800">
              <span>Durasi Rental:</span>
              <span className="text-white">
                {pricingInfo.durationDays} Hari ({pricingInfo.durationUnits} {pricingInfo.unitName})
              </span>
            </div>
            <div className="flex justify-between py-2 text-base sm:text-lg font-extrabold text-white pt-2">
              <span className="text-gold-400">Estimasi Total Biaya:</span>
              <span className="text-gold-400">
                {pricingInfo.estimatedTotal ? formatRupiah(pricingInfo.estimatedTotal) : "Sesuai Penawaran Admin"}
              </span>
            </div>
          </div>
        ) : null}

        {pricingError && (
          <div className="p-3.5 rounded-xl bg-amber-900/50 border border-amber-600/50 text-amber-200 text-xs">
            {pricingError}
          </div>
        )}

        {/* Checkbox Terms Agreement */}
        <div className="pt-2">
          <label className="flex items-start space-x-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              required
              className="w-4 h-4 mt-0.5 rounded text-gold-500 focus:ring-gold-400 bg-brand-900 border-brand-700"
            />
            <span className="text-xs text-brand-200 leading-relaxed">
              Saya telah membaca dan menyetujui{" "}
              <Link href="/syarat-ketentuan" target="_blank" className="text-gold-400 underline hover:text-gold-300">
                Syarat & Ketentuan Rental
              </Link>{" "}
              serta{" "}
              <Link href="/kebijakan-privasi" target="_blank" className="text-gold-400 underline hover:text-gold-300">
                Kebijakan Privasi
              </Link>{" "}
              TJ Rentcar. Saya memahami bahwa booking ini berstatus <strong>Pending</strong> sampai diverifikasi admin.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || (pricingInfo && !pricingInfo.available)}
          className="w-full py-4 px-6 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-brand-950 font-extrabold text-sm sm:text-base transition-colors shadow-md flex items-center justify-center space-x-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Memproses Permintaan Booking...</span>
            </>
          ) : (
            <span>Kirim Permintaan Booking (Menunggu Konfirmasi)</span>
          )}
        </button>
      </div>
    </form>
  );
}
