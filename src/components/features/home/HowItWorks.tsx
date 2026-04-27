"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { UserCheck, Images, Search, FileSignature, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

const stepIcons = [UserCheck, Images, Search, FileSignature];

export function HowItWorks() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });
  const { t } = useI18n();

  const steps = [1, 2, 3, 4].map((n, i) => ({
    step: String(n).padStart(2, "0"),
    icon: stepIcons[i],
    title: t(`hiw.step${n}.title`),
    description: t(`hiw.step${n}.desc`),
  }));

  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header — About-style */}
        <div ref={ref} className="max-w-2xl mb-14">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-xs font-bold text-[#0D9488] uppercase tracking-widest mb-3">
              {t("hiw.badge")}
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 leading-[1.1] mb-3">
              {t("hiw.heading")}
            </h2>
            <p className="text-gray-600 leading-relaxed">{t("hiw.subtext")}</p>
          </motion.div>
        </div>

        {/* Steps — clean numbered cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative bg-white rounded-2xl border border-gray-100 hover:border-[#0D9488]/40 hover:shadow-lg transition-all duration-300 p-7"
            >
              {/* Big faded step number behind content */}
              <span className="absolute top-5 right-5 font-heading text-5xl font-black text-gray-50 leading-none pointer-events-none select-none">
                {step.step}
              </span>

              {/* Icon tile */}
              <div className="relative w-12 h-12 rounded-xl bg-[#0D9488]/10 flex items-center justify-center mb-6 group-hover:bg-[#0D9488] transition-colors duration-300">
                <step.icon className="w-5 h-5 text-[#0D9488] group-hover:text-white transition-colors duration-300" />
              </div>

              <h3 className="relative font-heading font-bold text-gray-900 text-base mb-2">
                {step.title}
              </h3>
              <p className="relative text-sm text-gray-500 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Inline CTA */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-12 flex items-center gap-3"
        >
          <Link
            href="/qeydiyyat"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-[#0D9488] hover:bg-[#0F766E] text-white transition-colors shadow-sm"
          >
            {t("hiw.cta")}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <span className="text-sm text-gray-400">{t("hiw.freeNote")}</span>
        </motion.div>
      </div>
    </section>
  );
}
