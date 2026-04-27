import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, locale = "az-AZ"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "indicə";
  if (diffMins < 60) return `${diffMins} dəq əvvəl`;
  // For same day: show actual clock time
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays < 7) return `${diffDays} gün əvvəl`;
  return formatDate(d);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

export function formatCurrency(amount: number, currency = "AZN"): string {
  return new Intl.NumberFormat("az-AZ", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const SPECIALIZATION_LABELS: Record<string, string> = {
  architect: "Memar",
  interior_designer: "İnteryer Dizayneri",
  landscape_designer: "Landşaft Dizayneri",
  urban_designer: "Urban Dizayneri",
  student: "Memarlıq Tələbəsi",
  studio: "Dizayn Studiyası",
};

export const CATEGORY_LABELS: Record<string, string> = {
  architecture: "Memarlıq",
  interior: "İnteryer",
  landscape: "Landşaft",
  urban: "Urban Dizayn",
  renovation: "Renovasiya",
  commercial: "Kommersiya",
  residential: "Yaşayış",
  mixed_use: "Qarışıq İstifadə",
};

export const BUDGET_RANGE_LABELS: Record<string, string> = {
  under_5k: "5.000 AZN-dən az",
  "5k_15k": "5.000 – 15.000 AZN",
  "15k_50k": "15.000 – 50.000 AZN",
  "50k_100k": "50.000 – 100.000 AZN",
  over_100k: "100.000 AZN-dən çox",
};

export const CITIES = [
  "Bakı",
  "Gəncə",
  "Sumqayıt",
  "Mingəçevir",
  "Naxçıvan",
  "Lənkəran",
  "Şirvan",
  "Şəki",
  "Yevlax",
  "Xankəndi",
  "Abşeron",
  "Ağcabədi",
  "Ağdam",
  "Ağdaş",
  "Ağstafa",
  "Ağsu",
  "Astara",
  "Balakən",
  "Bərdə",
  "Beyləqan",
  "Biləsuvar",
  "Cəbrayıl",
  "Cəlilabad",
  "Daşkəsən",
  "Füzuli",
  "Gədəbəy",
  "Goranboy",
  "Göyçay",
  "Göygöl",
  "Hacıqabul",
  "İmişli",
  "İsmayıllı",
  "Kəlbəcər",
  "Kürdəmir",
  "Laçın",
  "Lerik",
  "Masallı",
  "Neftçala",
  "Oğuz",
  "Qax",
  "Qazax",
  "Qəbələ",
  "Qobustan",
  "Quba",
  "Qubadlı",
  "Qusar",
  "Saatlı",
  "Sabirabad",
  "Salyan",
  "Şamaxı",
  "Şəmkir",
  "Samux",
  "Siyəzən",
  "Şuşa",
  "Tərtər",
  "Tovuz",
  "Ucar",
  "Xaçmaz",
  "Xızı",
  "Xocavənd",
  "Zaqatala",
  "Zəngilan",
  "Zərdab",
];

export const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  junior: "Junior (0-2 il)",
  mid: "Mid (2-5 il)",
  senior: "Senior (5-10 il)",
  principal: "Principal (10+ il)",
};

export const BADGE_LABELS: Record<string, string> = {
  verified_architect: "Təsdiqlənmiş Memar",
  verified_studio: "Təsdiqlənmiş Studiya",
  top_portfolio: "Top Portfolio",
  projects_10: "10+ Layihə",
  featured: "Seçilmiş",
};

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateUsername(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/\s+/g, ".")
      .replace(/[^a-z0-9.]/g, "")
      .slice(0, 20) +
    "_" +
    Math.random().toString(36).slice(2, 6)
  );
}
