import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: "https://archilink.az", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: "https://archilink.az/memarlar", lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: "https://archilink.az/bazar", lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: "https://archilink.az/layiheler", lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: "https://archilink.az/haqqimizda", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: "https://archilink.az/elaqe", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: "https://archilink.az/yardim", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // Dynamic professional profile pages
  const { data: profiles } = await supabase.from("profiles").select("username, updatedAt");
  const profilePages: MetadataRoute.Sitemap = (profiles ?? []).map((p) => ({
    url: `https://archilink.az/memarlar/${p.username}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic project pages
  const { data: projects } = await supabase
    .from("portfolioProjects")
    .select("id, updatedAt")
    .eq("isPublished", true);
  const projectPages: MetadataRoute.Sitemap = (projects ?? []).map((p) => ({
    url: `https://archilink.az/layiheler/${p.id}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...profilePages, ...projectPages];
}
