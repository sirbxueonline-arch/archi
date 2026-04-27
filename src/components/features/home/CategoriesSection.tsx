"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

const categoryImages = [
  { slug: "architecture", image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80", gradient: "from-blue-600/80 to-blue-800/80" },
  { slug: "interior", image: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=600&q=80", gradient: "from-violet-600/80 to-violet-900/80" },
  { slug: "landscape", image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=80", gradient: "from-emerald-600/80 to-emerald-900/80" },
  { slug: "urban", image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80", gradient: "from-orange-600/80 to-orange-900/80" },
];

export function CategoriesSection() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });
  const { t } = useI18n();

  const categories = categoryImages.map((c) => ({
    ...c,
    label: t(`cat.${c.slug}.label`),
    description: t(`cat.${c.slug}.desc`),
    count: t(`cat.${c.slug}.count`),
  }));

  return (
    <section className="py-24 section-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
              {t("categories.badge")}
            </p>
            <div className="flex items-end justify-between">
              <h2 className="font-heading text-4xl font-bold text-foreground">
                {t("categories.heading")}
              </h2>
              <Link
                href="/layiheler"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
              >
                {t("common.viewAll")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link href={`/layiheler?kateqoriya=${cat.slug}`}>
                <div className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer shadow-card hover:shadow-card-hover transition-all duration-300">
                  <Image
                    src={cat.image}
                    alt={cat.label}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient}`} />
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <p className="text-white/70 text-xs mb-1">{cat.count}</p>
                    <h3 className="font-heading text-xl font-bold text-white mb-1">{cat.label}</h3>
                    <p className="text-white/80 text-xs leading-relaxed">{cat.description}</p>
                    <div className="mt-3 flex items-center gap-1.5 text-white/80 text-xs group-hover:text-white group-hover:gap-2.5 transition-all">
                      {t("common.explore")}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
