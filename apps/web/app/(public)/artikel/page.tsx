import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { formatDate } from "@/lib/formatters";
import { getAssetUrl } from "@/lib/asset-url";
import { Article } from "@/types";
import { BookOpen, Calendar, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Artikel dan Tips Rental Mobil | TJ Rentcar",
  description:
    "Baca panduan memilih mobil, memahami ketentuan sewa, dan merencanakan perjalanan bersama TJ Rentcar.",
  alternates: {
    canonical: "/artikel",
  },
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

async function getArticles(): Promise<Article[]> {
  try {
    const res = await fetch(`${API_BASE}/public/articles?limit=20`, { next: { revalidate: 120 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function ArticlesIndexPage() {
  const articles = await getArticles();

  const breadcrumbs = [{ name: "Artikel & Panduan", item: "/artikel" }];

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mb-10 border-b border-brand-100 pb-6">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-gold-700 uppercase tracking-widest mb-2">
            <span className="w-6 h-0.5 bg-gold-500 inline-block" />
            <span>Blog &amp; Panduan</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-950 tracking-tight">
            Artikel dan Panduan Rental Mobil
          </h1>
          <p className="text-sm sm:text-base text-brand-600 mt-3 leading-relaxed">
            Tips praktis seputar rental mobil di Jakarta, perbandingan layanan dengan sopir vs lepas kunci, persiapan dokumen, hingga rekomendasi rute perjalanan.
          </p>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {articles.map((art) => (
              <article
                key={art.slug}
                className="bg-white rounded-2xl border border-brand-200 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {art.featuredImageUrl && (
                    <div className="aspect-[16/10] bg-brand-50 overflow-hidden border-b border-brand-100">
                      <img
                        src={getAssetUrl(art.featuredImageUrl)}
                        alt={art.featuredImageAlt || art.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center space-x-3 text-xs text-brand-500 mb-3">
                      {art.category && (
                        <span className="px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-900 font-semibold text-[11px]">
                          {art.category}
                        </span>
                      )}
                      {art.publishedAt && (
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1 text-gold-600" />
                          {formatDate(art.publishedAt)}
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg font-bold text-brand-950 group-hover:text-gold-700 transition-colors leading-snug mb-2.5">
                      <Link href={`/artikel/${art.slug}`}>{art.title}</Link>
                    </h2>

                    {art.excerpt && (
                      <p className="text-xs sm:text-sm text-brand-600 line-clamp-3 leading-relaxed">
                        {art.excerpt}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-6 pt-3 border-t border-brand-100">
                  <Link
                    href={`/artikel/${art.slug}`}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-950 hover:text-gold-700 transition-colors"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gold-600" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-brand-50 rounded-2xl p-12 text-center border border-brand-200 max-w-lg mx-auto">
            <BookOpen className="w-10 h-10 text-gold-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-brand-950">
              Belum Ada Artikel Dipublikasikan
            </h3>
            <p className="text-xs text-brand-600 mt-1">
              Artikel panduan perjalanan dan tips rental mobil akan segera diperbarui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
