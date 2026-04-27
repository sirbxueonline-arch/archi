"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, User, ChevronRight, Tag } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  readTime: number;
  coverColor: string;
}

const ARTICLES: Article[] = [
  {
    id: "1",
    slug: "azerbaycanda-muasir-memarlig-trendleri",
    title: "Azərbaycanda Müasir Memarlıq Trendləri 2025",
    excerpt: "Son illərdə Bakıda baş verən memarlıq inqilabı: davamlı dizayn, biofil memarlıq və ağıllı binalar haqqında geniş araşdırma.",
    author: "Əli Həsənov",
    date: "2025-03-10",
    category: "Dizayn Trendləri",
    readTime: 8,
    coverColor: "bg-primary",
  },
  {
    id: "2",
    slug: "interyer-dizayn-meqalesi",
    title: "İnteryer Dizaynda Rəng Psixologiyası",
    excerpt: "Rənglərin insan psixologiyasına təsiri və interyer dizaynda doğru rəng palitrasının seçilməsi üçün praktik məsləhətlər.",
    author: "Nigar Əliyeva",
    date: "2025-03-05",
    category: "Memar Məsləhətləri",
    readTime: 6,
    coverColor: "bg-teal-600",
  },
  {
    id: "3",
    slug: "bim-texnologiyasi-memarligda",
    title: "BIM Texnologiyası Memarlıqda Necə İnqilab Edir?",
    excerpt: "Building Information Modeling sistemi ilə layihələrin planlaşdırılması, xərclərin azaldılması və komanda işinin optimallaşdırılması.",
    author: "Rauf Quliyev",
    date: "2025-02-28",
    category: "Texnologiya",
    readTime: 10,
    coverColor: "bg-primary",
  },
  {
    id: "4",
    slug: "baki-sahil-bulvar-case-study",
    title: "Bakı Sahil Bulvarı: Şəhər Məkanının Yenilənməsi",
    excerpt: "Bakı Bulvarının yenidən qurulması prosesi, arxitektura həlləri və ictimai məkanların dizaynı haqqında ətraflı case study.",
    author: "Ləman Süleymanova",
    date: "2025-02-20",
    category: "Case Study",
    readTime: 12,
    coverColor: "bg-emerald-500",
  },
  {
    id: "5",
    slug: "davamli-memarliq-azerbaycan",
    title: "Davamlı Memarlıq: Azərbaycanda Yaşıl Bina Standartları",
    excerpt: "LEED və BREEAM sertifikasiyası, enerji effektivliyi və ekoloji memarlıq prinsiplərinin yerli tətbiqi.",
    author: "Kamran Babayev",
    date: "2025-02-14",
    category: "Dizayn Trendləri",
    readTime: 9,
    coverColor: "bg-green-600",
  },
  {
    id: "6",
    slug: "kicik-mekan-dizayn-sirrleri",
    title: "Kiçik Məkanlar üçün Dizayn Sirləri",
    excerpt: "Kompakt yaşayış sahələrini funksional və estetik cəhətdən cəlbedici etmək üçün memarların tətbiq etdiyi 10 effektiv üsul.",
    author: "Sevinc Məmmədova",
    date: "2025-02-08",
    category: "Memar Məsləhətləri",
    readTime: 5,
    coverColor: "bg-amber-500",
  },
  {
    id: "7",
    slug: "3d-cixaris-memar-aletleri",
    title: "3D Çıxarış: Memarın Ən Güclü Satış Aləti",
    excerpt: "Müasir 3D vizualizasiya texnologiyaları, virtual reality turlar və müştəri ünsiyyətinin yaxşılaşdırılması üçün rəqəmsal alətlər.",
    author: "Elçin Nəsirov",
    date: "2025-01-30",
    category: "Texnologiya",
    readTime: 7,
    coverColor: "bg-cyan-500",
  },
  {
    id: "8",
    slug: "gence-yeni-mahalle-case-study",
    title: "Gəncə Yeni Məhəllə: İctimai Məkan Layihəsi",
    excerpt: "Gəncə şəhərinin cənub hissəsindəki yaşayış kompleksinin memarlıq konsepsiyası, ictimai məkanların layihələndirilməsi.",
    author: "Aynur Hüseynova",
    date: "2025-01-22",
    category: "Case Study",
    readTime: 11,
    coverColor: "bg-primary",
  },
];

const CATEGORIES = ["Hamısı", "Memar Məsləhətləri", "Dizayn Trendləri", "Texnologiya", "Case Study"];
const INITIAL_VISIBLE = 7;

function formatArticleDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("az-AZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  const { t } = useI18n();

  if (featured) {
    return (
      <Link href={`/blog/${article.slug}`} className="group block col-span-full">
        <div className="rounded-2xl border border-border bg-white overflow-hidden hover:shadow-lg transition-shadow flex flex-col md:flex-row">
          <div className={`${article.coverColor} md:w-2/5 min-h-[220px] flex items-center justify-center`}>
            <BookOpen className="w-20 h-20 text-white/30" />
          </div>
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {article.category}
                </span>
                <span className="text-xs text-muted-foreground font-medium">Seçilmiş Yazı</span>
              </div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors leading-tight">
                {article.title}
              </h2>
              <p className="text-slate-600 text-base leading-relaxed mb-4">{article.excerpt}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {article.author}
              </span>
              <span>{formatArticleDate(article.date)}</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {article.readTime} {t("blog.minRead")}
              </span>
              <span className="ml-auto flex items-center gap-1 text-primary font-semibold group-hover:gap-2 transition-all">
                Oxu <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${article.slug}`} className="group block">
      <div className="rounded-2xl border border-border bg-white overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
        <div className={`${article.coverColor} h-40 flex items-center justify-center`}>
          <BookOpen className="w-12 h-12 text-white/30" />
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="mb-3">
            <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
              {article.category}
            </span>
          </div>
          <h3 className="font-heading text-base font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors leading-snug line-clamp-2">
            {article.title}
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 flex-1 mb-4">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-auto pt-3 border-t border-border">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {article.author}
            </span>
            <span className="ml-auto flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readTime} {t("blog.minRead")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function BlogPage() {
  const { t } = useI18n();
  const [activeCategory, setActiveCategory] = useState("Hamısı");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const filtered = activeCategory === "Hamısı"
    ? ARTICLES
    : ARTICLES.filter((a) => a.category === activeCategory);

  const featured = filtered[0];
  const rest = filtered.slice(1, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E2D4D] to-[#1E1040] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">
            {t("blog.title")}
          </h1>
          <p className="text-white/70 text-lg max-w-xl">
            {t("blog.subtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setVisibleCount(INITIAL_VISIBLE); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                activeCategory === cat
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-slate-600 border-border hover:border-primary hover:text-primary"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-border bg-white">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-slate-500">Bu kateqoriyada yazı tapılmadı</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured && <ArticleCard article={featured} featured />}
            {rest.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setVisibleCount((v) => v + 3)}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
            >
              {t("blog.loadMore")}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
