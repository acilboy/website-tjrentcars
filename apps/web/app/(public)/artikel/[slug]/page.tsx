import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { formatDate } from "@/lib/formatters";
import { Calendar, User, ArrowLeft, Share2 } from "lucide-react";
import { Article } from "@/types";
import { getAssetUrl } from "@/lib/asset-url";

interface Props {
  params: { slug: string };
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

async function getArticleDetail(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${API_BASE}/public/articles/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticleDetail(params.slug);
  if (!article) {
    return { title: "Artikel Tidak Ditemukan | TJ Rentcar" };
  }

  const title = article.metaTitle || `${article.title} | TJ Rentcar`;
  const description = article.metaDescription || article.excerpt || "Artikel panduan rental mobil TJ Rentcar Jakarta.";

  return {
    title,
    description,
    alternates: {
      canonical: `/artikel/${article.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.publishedAt || undefined,
      images: article.ogImageUrl ? [{ url: getAssetUrl(article.ogImageUrl) }] : undefined,
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const article = await getArticleDetail(params.slug);

  if (!article) {
    notFound();
  }

  const breadcrumbs = [
    { name: "Artikel", item: "/artikel" },
    { name: article.title, item: `/artikel/${article.slug}` },
  ];

  return (
    <div>
      <JsonLd article={article} />
      <Breadcrumbs items={breadcrumbs} />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div>
          <Link
            href="/artikel"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Indeks Artikel</span>
          </Link>

          <div className="flex items-center space-x-3 text-xs text-brand-500 mb-3">
            {article.category && (
              <span className="px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-900 font-semibold text-xs">
                {article.category}
              </span>
            )}
            {article.publishedAt && (
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-gold-600" />
                {formatDate(article.publishedAt)}
              </span>
            )}
            {article.authorName && (
              <span className="flex items-center">
                <User className="w-3.5 h-3.5 mr-1 text-gold-600" />
                {article.authorName}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-950 tracking-tight leading-tight">
            {article.title}
          </h1>
        </div>

        {article.featuredImageUrl && (
          <div className="rounded-2xl overflow-hidden aspect-[16/9] bg-brand-50 border border-brand-200 shadow-sm">
            <img
              src={getAssetUrl(article.featuredImageUrl)}
              alt={article.featuredImageAlt || article.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        )}

        <div className="bg-white rounded-2xl border border-brand-200 p-7 sm:p-11 shadow-sm">
          <div className="prose max-w-none text-brand-700 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4">
            {article.content}
          </div>
        </div>

        {/* CTA in Article */}
        <div className="bg-brand-950 text-white border-t-2 border-gold-500 rounded-2xl p-7 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-lg font-bold text-white">
              Butuh Kendaraan untuk Perjalanan Anda di Jakarta?
            </h3>
            <p className="text-xs text-brand-300 mt-1">
              Pilih armada terawat dengan sopir atau lepas kunci sekarang di TJ Rentcar.
            </p>
          </div>
          <Link
            href="/mobil"
            className="px-5 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-brand-950 font-extrabold text-xs sm:text-sm whitespace-nowrap shadow-sm transition-colors"
          >
            Lihat Pilihan Armada
          </Link>
        </div>
      </article>
    </div>
  );
}
