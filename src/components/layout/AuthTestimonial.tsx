"use client";

import { useI18n } from "@/lib/i18n/context";

export function AuthTestimonial() {
  const { t } = useI18n();
  return (
    <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <p className="text-gray-300 text-sm leading-relaxed mb-4">
        &ldquo;{t("auth.testimonial.quote")}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">
          KƏ
        </div>
        <div>
          <p className="text-white font-medium text-sm">Kamran Əliyev</p>
          <p className="text-gray-400 text-xs">{t("auth.testimonial.role")}</p>
        </div>
      </div>
    </div>
  );
}
