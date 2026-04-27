"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n/context";
import { Gift, Copy, Check, Share2, Users, UserCheck, Banknote, ChevronRight } from "lucide-react";

interface ReferralStats {
  invited: number;
  registered: number;
  earned: number;
}

function generateCode(userId: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seed = userId.replace(/-/g, "").slice(0, 6);
  let code = "";
  for (let i = 0; i < 6; i++) {
    const charIndex = seed.charCodeAt(i % seed.length) % chars.length;
    code += chars[charIndex];
  }
  return `ARCH-${code}`;
}

export default function ReferralPage() {
  const { t } = useI18n();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const stats: ReferralStats = { invited: 0, registered: 0, earned: 0 };

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) setUserId(session.user.id);
      setLoading(false);
    };
    load();
  }, []);

  const referralCode = userId ? generateCode(userId) : "ARCH-······";
  const referralLink = `https://archilink.az/qeydiyyat?ref=${referralCode}`;

  const handleCopyCode = () => {
    if (!userId) return;
    navigator.clipboard.writeText(referralCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleCopyLink = () => {
    if (!userId) return;
    navigator.clipboard.writeText(referralLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="h-40 bg-muted rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Gift className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold">{t("referral.title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("referral.subtitle")}
          </p>
        </div>
      </div>

      {/* Referral Code Box */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <p className="text-sm font-semibold text-slate-600 mb-3">{t("referral.yourCode")}</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-slate-50 border border-border rounded-xl px-5 py-4 font-heading text-2xl font-bold tracking-[0.2em] text-primary text-center select-all">
            {referralCode}
          </div>
          <button
            onClick={handleCopyCode}
            disabled={!userId}
            className="flex items-center gap-2 px-5 py-4 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
          >
            {codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {codeCopied ? t("referral.copied") : t("referral.copy")}
          </button>
        </div>

        {/* Share Link */}
        <div className="mt-5">
          <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5" />
            {t("referral.inviteLink")}
          </p>
          <div className="flex items-center gap-2 bg-slate-50 border border-border rounded-xl px-4 py-3">
            <span className="flex-1 text-xs text-slate-600 truncate font-mono">{referralLink}</span>
            <button
              onClick={handleCopyLink}
              disabled={!userId}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border text-xs font-semibold text-slate-700 hover:bg-muted transition-colors shrink-0 disabled:opacity-50"
            >
              {linkCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {linkCopied ? t("referral.copied") : t("referral.copy")}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5 text-primary" />}
          iconBg="bg-primary/10"
          label={t("referral.invited")}
          value={stats.invited}
          unit=""
        />
        <StatCard
          icon={<UserCheck className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
          label={t("referral.registered")}
          value={stats.registered}
          unit=""
        />
        <StatCard
          icon={<Banknote className="w-5 h-5 text-amber-600" />}
          iconBg="bg-amber-50"
          label={t("referral.bonus")}
          value={stats.earned}
          unit=" AZN"
        />
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <h2 className="font-heading font-bold text-slate-900 mb-5 flex items-center gap-2">
          <ChevronRight className="w-5 h-5 text-primary" />
          {t("referral.howTitle")}
        </h2>
        <div className="space-y-4">
          <HowStep
            number={1}
            title={t("referral.step1Title")}
            description={t("referral.step1Desc")}
          />
          <HowStep
            number={2}
            title={t("referral.step2Title")}
            description={t("referral.step2Desc")}
          />
          <HowStep
            number={3}
            title={t("referral.step3Title")}
            description={t("referral.step3Desc")}
          />
        </div>
      </div>

      {/* Referrals List Placeholder */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <h2 className="font-heading font-bold text-slate-900 mb-4">{t("referral.listTitle")}</h2>
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <p className="text-slate-500 font-medium mb-1">{t("referral.listEmpty")}</p>
          <p className="text-sm text-muted-foreground">
            {t("referral.listEmptySub")}
          </p>
        </div>
      </div>

      {/* Terms Note */}
      <p className="text-xs text-muted-foreground text-center pb-4">
        {t("referral.terms")}
      </p>
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 text-center">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mx-auto mb-3`}>
        {icon}
      </div>
      <p className="font-heading text-2xl font-bold text-slate-900">
        {value}
        <span className="text-base font-normal">{unit}</span>
      </p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function HowStep({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-heading font-bold text-sm shrink-0 mt-0.5">
        {number}
      </div>
      <div>
        <p className="font-semibold text-slate-900 mb-0.5">{title}</p>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
