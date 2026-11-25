"use client";

import { useRef, useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { api, ApiClientError } from "@/lib/api-client";
import type { FieldErrors } from "@/lib/validation";
import {
  MESSAGE_MAX,
  MESSAGE_MIN,
  PHONE_HINT,
  mapApiFieldErrors,
  validateOptionalEmail,
  validatePersonName,
  validateRequiredText,
  validateWhatsAppNumber,
} from "@/lib/validation";

const CONTACT_FIELDS = ["name", "contact", "email", "message"] as const;

type ContactField = (typeof CONTACT_FIELDS)[number];

export function ContactFormClient() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  const getFieldValue = (field: ContactField): string => {
    switch (field) {
      case "name":
        return name;
      case "contact":
        return contact;
      case "email":
        return email;
      case "message":
        return message;
    }
  };

  const setFieldValue = (field: ContactField, value: string) => {
    switch (field) {
      case "name":
        setName(value);
        break;
      case "contact":
        setContact(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "message":
        setMessage(value);
        break;
    }
  };

  const validateField = (field: ContactField, value: string): string | null => {
    switch (field) {
      case "name":
        return validatePersonName(value);
      case "contact":
        return validateWhatsAppNumber(value);
      case "email":
        return validateOptionalEmail(value);
      case "message":
        return validateRequiredText(value, "Pesan", MESSAGE_MIN, MESSAGE_MAX);
      default:
        return null;
    }
  };

  const collectErrors = (): FieldErrors => {
    const next: FieldErrors = {};
    for (const field of CONTACT_FIELDS) {
      const message = validateField(field, getFieldValue(field));
      if (message) next[field] = message;
    }
    return next;
  };

  const focusFirstError = (next: FieldErrors) => {
    const first = CONTACT_FIELDS.find((field) => next[field]);
    if (!first) return;
    const element = formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`);
    element?.focus();
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleBlur = (field: ContactField) => {
    const message = validateField(field, getFieldValue(field));
    setErrors((prev) => ({ ...prev, [field]: message || "" }));
  };

  const handleFieldChange = (field: ContactField, value: string) => {
    setFieldValue(field, value);
    if (errors[field]) {
      const message = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: message || "" }));
    }
  };

  const fieldClass = (field: ContactField) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm text-brand-950 bg-brand-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-colors ${
      errors[field]
        ? "border-red-400 focus:ring-red-200 focus:border-red-500"
        : "border-brand-200 focus:ring-gold-500/30 focus:border-brand-950"
    }`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccess(false);

    const nextErrors = collectErrors();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setErrorMsg("Periksa kembali data yang Anda isi.");
      focusFirstError(nextErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      await api.submitContact({
        name,
        contact,
        email: email || null,
        message,
      });

      setSuccess(true);
      setName("");
      setContact("");
      setEmail("");
      setMessage("");
      setErrors({});
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        const fieldErrors = mapApiFieldErrors(err.details, [...CONTACT_FIELDS]);
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          focusFirstError(fieldErrors);
        }
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Gagal mengirim pesan. Silakan coba kembali atau hubungi WhatsApp.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Pesan Berhasil Terkirim!</strong>
            <span>Terima kasih, tim TJ Rentcar akan segera membalas pertanyaan Anda.</span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div>
        <label htmlFor="contact-name" className="text-xs font-semibold text-slate-700 block mb-1.5">
          Nama Lengkap *
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => handleFieldChange("name", e.target.value)}
          onBlur={() => handleBlur("name")}
          required
          autoComplete="name"
          inputMode="text"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          placeholder="Nama Anda"
          className={fieldClass("name")}
        />
        {errors.name && (
          <p id="contact-name-error" className="mt-1.5 text-[11px] font-medium text-red-600">
            {errors.name}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-phone" className="text-xs font-semibold text-slate-700 block mb-1.5">
            Nomor WhatsApp / HP *
          </label>
          <input
            id="contact-phone"
            name="contact"
            type="tel"
            value={contact}
            onChange={(e) => handleFieldChange("contact", e.target.value)}
            onBlur={() => handleBlur("contact")}
            required
            autoComplete="tel"
            inputMode="tel"
            aria-invalid={Boolean(errors.contact)}
            aria-describedby={errors.contact ? "contact-phone-error" : "contact-phone-hint"}
            placeholder="08xxxxxxxxxx"
            className={fieldClass("contact")}
          />
          {errors.contact ? (
            <p id="contact-phone-error" className="mt-1.5 text-[11px] font-medium text-red-600">
              {errors.contact}
            </p>
          ) : (
            <span id="contact-phone-hint" className="text-[11px] text-slate-400 mt-1 block">
              {PHONE_HINT}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="contact-email" className="text-xs font-semibold text-slate-700 block mb-1.5">
            Alamat Email (Opsional)
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => handleFieldChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            autoComplete="email"
            inputMode="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            placeholder="nama@email.com"
            className={fieldClass("email")}
          />
          {errors.email && (
            <p id="contact-email-error" className="mt-1.5 text-[11px] font-medium text-red-600">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className="text-xs font-semibold text-slate-700 block mb-1.5">
          Pesan / Pertanyaan Anda *
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          value={message}
          onChange={(e) => handleFieldChange("message", e.target.value)}
          onBlur={() => handleBlur("message")}
          required
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          placeholder="Tuliskan pertanyaan mengenai ketersediaan mobil, rute luar kota, atau sewa bulanan..."
          className={fieldClass("message")}
        ></textarea>
        {errors.message && (
          <p id="contact-message-error" className="mt-1.5 text-[11px] font-medium text-red-600">
            {errors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-6 rounded-xl bg-brand-950 hover:bg-brand-800 text-white font-bold text-sm transition-colors shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
            <span>Mengirim Pesan...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4 text-gold-400" />
            <span>Kirim Pesan Sekarang</span>
          </>
        )}
      </button>
    </form>
  );
}
