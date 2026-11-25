"use client";

import { useEffect, useState } from "react";
import { MessageSquare, MessageCircle, Mail, Clock, CheckCircle2, Trash2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatDateTime, buildWhatsAppLink } from "@/lib/formatters";

export default function AdminContactsPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = () => {
    setLoading(true);
    api.getAdminContacts()
      .then((data) => setMessages(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.updateContactStatus(id, status);
      fetchContacts();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight">
          Pesan & Permintaan Informasi Pelanggan
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Daftar pesan masuk dari formulir kontak website TJ Rentcar.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-4">Tanggal Masuk</th>
                <th className="p-4">Pengirim</th>
                <th className="p-4">Kontak</th>
                <th className="p-4">Isi Pesan</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Tindak Lanjut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Memuat pesan kontak...
                  </td>
                </tr>
              ) : messages.length > 0 ? (
                messages.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-4 text-slate-500">{formatDateTime(m.createdAt)}</td>
                    <td className="p-4 font-bold text-brand-950">{m.name}</td>
                    <td className="p-4">
                      <span className="block font-semibold text-slate-900">{m.contact}</span>
                      {m.email && <span className="text-[11px] text-slate-400">{m.email}</span>}
                    </td>
                    <td className="p-4 max-w-sm text-slate-600 leading-relaxed">{m.message}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === "NEW"
                            ? "bg-amber-100 text-amber-800"
                            : m.status === "READ"
                            ? "bg-blue-100 text-blue-800"
                            : m.status === "FOLLOWED_UP"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <a
                        href={buildWhatsAppLink(
                          m.contact,
                          `Halo Bapak/Ibu ${m.name}, kami dari tim TJ Rentcar merespons pesan yang Anda kirimkan melalui website...`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 inline-block text-emerald-600 hover:text-emerald-700"
                        title="Balas via WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 inline" />
                      </a>
                      {m.status === "NEW" && (
                        <button
                          onClick={() => handleUpdateStatus(m.id, "FOLLOWED_UP")}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
                        >
                          Tandai Selesai
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Belum ada pesan kontak masuk.
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
