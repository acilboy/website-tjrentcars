"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Plus, Edit3, Trash2, CheckCircle2, AlertCircle, Eye } from "lucide-react";
import { api, ApiClientError } from "@/lib/api-client";
import { Article, ArticleStatus } from "@/types";
import { formatDate } from "@/lib/formatters";

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Add modal
  const [editingArticle, setEditingArticle] = useState<any | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Panduan Rental");
  const [authorName, setAuthorName] = useState("Tim Redaksi TJ Rentcar");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<ArticleStatus>("DRAFT");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchArticles = () => {
    setLoading(true);
    api.getAdminArticles()
      .then((data) => setArticles(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleOpenAdd = () => {
    setEditingArticle({ id: "NEW" });
    setTitle("");
    setSlug("");
    setCategory("Panduan Rental");
    setAuthorName("Tim Redaksi TJ Rentcar");
    setExcerpt("");
    setContent("");
    setStatus("DRAFT");
    setMetaTitle("");
    setMetaDesc("");
    setFormError(null);
  };

  const handleOpenEdit = (a: Article) => {
    setEditingArticle(a);
    setTitle(a.title);
    setSlug(a.slug);
    setCategory(a.category || "Panduan Rental");
    setAuthorName(a.authorName || "Tim Redaksi TJ Rentcar");
    setExcerpt(a.excerpt || "");
    setContent(a.content || "");
    setStatus((a as any).status || "DRAFT");
    setMetaTitle(a.metaTitle || "");
    setMetaDesc(a.metaDescription || "");
    setFormError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      const payload = {
        title,
        slug,
        category,
        authorName,
        excerpt,
        content,
        status,
        metaTitle: metaTitle || null,
        metaDescription: metaDesc || null,
      };

      if (editingArticle.id === "NEW") {
        await api.createAdminArticle(payload);
      } else {
        await api.updateAdminArticle(editingArticle.id, payload);
      }

      setEditingArticle(null);
      fetchArticles();
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        setFormError(err.message);
      } else {
        setFormError("Gagal menyimpan artikel.");
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus artikel ini?")) return;
    try {
      await api.deleteAdminArticle(id);
      fetchArticles();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight">
            Manajemen Artikel & Tips
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tulis dan publikasikan panduan informasional untuk mendukung strategi SEO TJ Rentcar.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tulis Artikel Baru</span>
        </button>
      </div>

      {editingArticle && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md max-w-3xl space-y-5 animate-fadeIn">
          <h2 className="text-base font-bold text-brand-950 pb-2 border-b border-slate-100">
            {editingArticle.id === "NEW" ? "Tulis Artikel Baru" : `Edit Artikel: ${editingArticle.title}`}
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
                <label className="text-xs font-semibold text-slate-700 block mb-1">Judul Artikel *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (editingArticle.id === "NEW" && !slug) {
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
                <label className="text-xs font-semibold text-slate-700 block mb-1">Status Publikasi</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                >
                  <option value="DRAFT">DRAFT (Belum Tampil di Publik)</option>
                  <option value="PUBLISHED">PUBLISHED (Tampil di Publik)</option>
                  <option value="ARCHIVED">ARCHIVED (Diarsipkan)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Ringkasan / Excerpt</label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Ringkasan 1-2 kalimat untuk kartu artikel..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
              ></textarea>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Konten Artikel Lengkap *</label>
              <textarea
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingArticle(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-5 py-2 rounded-xl bg-brand-900 text-white text-xs font-bold hover:bg-brand-800 disabled:opacity-50"
              >
                {formLoading ? "Menyimpan..." : "Simpan Artikel"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Articles Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-4">Judul Artikel</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Status</th>
                <th className="p-4">Tanggal Rilis</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Memuat artikel...
                  </td>
                </tr>
              ) : articles.length > 0 ? (
                articles.map((a: any) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <span className="font-bold text-brand-950 block">{a.title}</span>
                      <span className="text-[11px] font-mono text-slate-400">/{a.slug}</span>
                    </td>
                    <td className="p-4">{a.category || "-"}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          a.status === "PUBLISHED"
                            ? "bg-emerald-100 text-emerald-800"
                            : a.status === "DRAFT"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{a.publishedAt ? formatDate(a.publishedAt) : "-"}</td>
                    <td className="p-4 text-right space-x-2">
                      {a.status === "PUBLISHED" && (
                        <Link
                          href={`/artikel/${a.slug}`}
                          target="_blank"
                          className="p-1.5 inline-block text-slate-400 hover:text-brand-900"
                          title="Lihat halaman publik"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      )}
                      <button
                        onClick={() => handleOpenEdit(a)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-brand-900 font-semibold hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Belum ada artikel yang dibuat.
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
