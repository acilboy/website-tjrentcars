"use client";

import { useEffect, useState } from "react";
import { FileText, HelpCircle, Plus, Edit3, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { api, ApiClientError } from "@/lib/api-client";
import { ContentPage, FAQ } from "@/types";

export default function AdminContentPage() {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  // Page Editor
  const [editingPage, setEditingPage] = useState<ContentPage | null>(null);
  const [pageTitle, setPageTitle] = useState("");
  const [pageContent, setPageContent] = useState("");
  const [pageMetaTitle, setPageMetaTitle] = useState("");
  const [pageMetaDesc, setPageMetaDesc] = useState("");
  const [pageSubmitting, setPageSubmitting] = useState(false);

  // FAQ Editor
  const [editingFaq, setEditingFaq] = useState<any | null>(null);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqCategory, setFaqCategory] = useState("");
  const [faqSubmitting, setFaqSubmitting] = useState(false);

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([api.getAdminPages(), api.getAdminFaqs()])
      .then(([pagesData, faqsData]) => {
        setPages(pagesData);
        setFaqs(faqsData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditPage = (p: ContentPage) => {
    setEditingPage(p);
    setPageTitle(p.title);
    setPageContent(p.content);
    setPageMetaTitle(p.metaTitle || "");
    setPageMetaDesc(p.metaDescription || "");
    setFeedback(null);
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;
    setPageSubmitting(true);
    setFeedback(null);

    try {
      await api.updateAdminPage(editingPage.id, {
        title: pageTitle,
        content: pageContent,
        metaTitle: pageMetaTitle || null,
        metaDescription: pageMetaDesc || null,
      });
      setFeedback({ type: "success", text: "Konten halaman berhasil diperbarui." });
      setEditingPage(null);
      fetchData();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Gagal memperbarui halaman." });
    } finally {
      setPageSubmitting(false);
    }
  };

  const handleOpenAddFaq = () => {
    setEditingFaq({ id: "NEW" });
    setFaqQuestion("");
    setFaqAnswer("");
    setFaqCategory("Umum");
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setFaqSubmitting(true);
    setFeedback(null);

    try {
      if (editingFaq.id === "NEW") {
        await api.createAdminFaq({
          question: faqQuestion,
          answer: faqAnswer,
          category: faqCategory || "Umum",
          isActive: true,
        });
      } else {
        // update
      }
      setEditingFaq(null);
      fetchData();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Gagal menyimpan FAQ." });
    } finally {
      setFaqSubmitting(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm("Hapus pertanyaan FAQ ini?")) return;
    try {
      await api.deleteAdminFaq(id);
      fetchData();
    } catch {}
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight">
          Manajemen Konten & Tanya Jawab (FAQ)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Kelola halaman informasi perusahaan, syarat & ketentuan, kebijakan privasi, serta FAQ beranda.
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

      {/* 1. HALAMAN STATIS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 font-bold text-base text-brand-950 pb-3 border-b border-slate-100">
          <FileText className="w-5 h-5 text-gold-500" />
          <span>Halaman Konten Website (CMS)</span>
        </div>

        {editingPage ? (
          <form onSubmit={handleSavePage} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-brand-950">Edit Halaman: /{editingPage.slug}</h3>
              <button
                type="button"
                onClick={() => setEditingPage(null)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Tutup
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Judul Halaman</label>
                <input
                  type="text"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">SEO Meta Title</label>
                <input
                  type="text"
                  value={pageMetaTitle}
                  onChange={(e) => setPageMetaTitle(e.target.value)}
                  placeholder="Judul untuk Google Search"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Isi Konten Lengkap</label>
              <textarea
                rows={8}
                value={pageContent}
                onChange={(e) => setPageContent(e.target.value)}
                required
                className="w-full p-3 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 font-sans"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditingPage(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={pageSubmitting}
                className="px-5 py-2 rounded-xl bg-brand-900 text-white text-xs font-bold hover:bg-brand-800 disabled:opacity-50"
              >
                {pageSubmitting ? "Menyimpan..." : "Simpan Halaman"}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {pages.map((p) => (
              <div key={p.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-semibold text-slate-400 block mb-1">/{p.slug}</span>
                  <h3 className="font-bold text-sm text-brand-950 mb-2">{p.title}</h3>
                </div>
                <div className="pt-4 mt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">Terakhir diubah</span>
                  <button
                    onClick={() => handleEditPage(p)}
                    className="px-3 py-1 rounded-lg bg-brand-900 text-white text-xs font-semibold hover:bg-brand-800"
                  >
                    Edit Konten
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. FAQ */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 font-bold text-base text-brand-950">
            <HelpCircle className="w-5 h-5 text-gold-500" />
            <span>Frequently Asked Questions (FAQ)</span>
          </div>

          <button
            onClick={handleOpenAddFaq}
            className="px-3 py-1.5 rounded-xl bg-brand-900 text-white text-xs font-semibold hover:bg-brand-800 flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Pertanyaan</span>
          </button>
        </div>

        {editingFaq && (
          <form onSubmit={handleSaveFaq} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs text-brand-950">Tambah FAQ Baru</h4>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Pertanyaan</label>
              <input
                type="text"
                value={faqQuestion}
                onChange={(e) => setFaqQuestion(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Jawaban</label>
              <textarea
                rows={3}
                value={faqAnswer}
                onChange={(e) => setFaqAnswer(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditingFaq(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={faqSubmitting}
                className="px-4 py-1.5 rounded-xl bg-brand-900 text-white text-xs font-bold disabled:opacity-50"
              >
                Simpan FAQ
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-start gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-brand-950">{faq.question}</h4>
                <p className="text-xs text-slate-600">{faq.answer}</p>
              </div>
              <button
                onClick={() => handleDeleteFaq(faq.id)}
                className="p-1.5 text-rose-500 hover:text-rose-700 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
