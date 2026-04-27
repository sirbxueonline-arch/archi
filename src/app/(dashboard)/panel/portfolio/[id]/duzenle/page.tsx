"use client";

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase";
import {
  X,
  Plus,
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  Eye,
  EyeOff,
  Trash2,
  Video,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updatePortfolioProject, getPortfolioProjectById } from "@/server/actions/projects";
import { toast } from "sonner";
import { CATEGORY_LABELS, CITIES } from "@/lib/utils";
import Link from "next/link";

const projectSchema = z.object({
  title: z.string().min(3, "Ən az 3 simvol"),
  description: z.string().optional(),
  category: z.string().min(1, "Kateqoriya seçin"),
  location: z.string().optional(),
  city: z.string().optional(),
  area: z.coerce.number().optional(),
  year: z.coerce.number().min(1990).max(new Date().getFullYear()).optional(),
  client: z.string().optional(),
  tags: z.string().optional(),
  videoUrl: z.string().url("Düzgün URL daxil edin").optional().or(z.literal("")),
  beforeImage: z.string().url("Düzgün URL daxil edin").optional().or(z.literal("")),
  afterImage: z.string().url("Düzgün URL daxil edin").optional().or(z.literal("")),
  isPublished: z.boolean().default(true),
});

type ProjectForm = z.infer<typeof projectSchema>;

export default function EditPortfolioProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [existingImages, setExistingImages] = useState<{ url: string }[]>([]);
  const [newImages, setNewImages] = useState<{ url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectForm>({ resolver: zodResolver(projectSchema) });

  const isPublished = watch("isPublished");

  useEffect(() => {
    const load = async () => {
      const supabaseAuth = createClient();
      const { data: { session } } = await supabaseAuth.auth.getSession();
      if (!session) {
        toast.error("Giriş tələb olunur");
        router.push("/giris?callbackUrl=/panel");
        return;
      }
      const project = await getPortfolioProjectById(session.user.id, id);
      if (!project) {
        toast.error("Layihə tapılmadı");
        router.push("/panel/portfolio");
        return;
      }
      reset({
        title: project.title,
        description: project.description ?? "",
        category: project.category,
        location: project.location ?? "",
        city: project.city ?? "",
        area: project.area ?? undefined,
        year: project.year ?? undefined,
        client: project.client ?? "",
        tags: ((project.tags as string[]) ?? []).join(", "),
        videoUrl: (project as any).videoUrl ?? "",
        beforeImage: (project as any).beforeImage ?? "",
        afterImage: (project as any).afterImage ?? "",
        isPublished: project.isPublished ?? true,
      });
      const imgs = ((project.images as any[]) ?? []).sort(
        (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)
      );
      setExistingImages(imgs.map((img: any) => ({ url: img.url })));
      setLoadingData(false);
    };
    load();
  }, [id, reset, router, toast]);

  const onSubmit = async (data: ProjectForm) => {
    const supabaseAuth = createClient();
    const { data: { session } } = await supabaseAuth.auth.getSession();
    if (!session) {
      toast.error("Giriş tələb olunur");
      return;
    }

    const tags = data.tags
      ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const result = await updatePortfolioProject(session.user.id, id, {
      ...data,
      tags,
      videoUrl: data.videoUrl || undefined,
      beforeImage: data.beforeImage || undefined,
      afterImage: data.afterImage || undefined,
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Layihə yeniləndi!");
      router.push("/panel/portfolio");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const totalImages = existingImages.length + newImages.length;
    const remaining = 20 - totalImages;
    const toUpload = files.slice(0, remaining);

    setUploading(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id ?? "anon";

    const uploaded: { url: string }[] = [];
    for (const file of toUpload) {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("portfolio-images")
        .upload(path, file, { upsert: true });
      if (error) {
        uploaded.push({ url: URL.createObjectURL(file) });
        toast.error("Şəkil yüklənmədi");
      } else {
        const { data: pub } = supabase.storage.from("portfolio-images").getPublicUrl(path);
        uploaded.push({ url: pub.publicUrl });
      }
    }
    setNewImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const allImages = [...existingImages, ...newImages];

  if (loadingData) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/panel/portfolio">
          <Button type="button" variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold">Layihəni Düzəlt</h1>
          <p className="text-muted-foreground text-sm">Portfolio layihənizi yeniləyin</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setValue("isPublished", !isPublished)}
          >
            {isPublished ? (
              <>
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Yayımlanıb</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Gizli</span>
              </>
            )}
          </Button>
          <Button type="submit" variant="gradient" loading={isSubmitting}>
            Yadda Saxla
          </Button>
        </div>
      </div>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Layihə Şəkilləri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-3">
            {allImages.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={img.url} alt={`Şəkil ${i + 1}`} className="w-full h-full object-cover" />
                {i === 0 && (
                  <div className="absolute top-1 left-1 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded">
                    Kapaq
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (i < existingImages.length) {
                      setExistingImages(existingImages.filter((_, j) => j !== i));
                    } else {
                      setNewImages(newImages.filter((_, j) => j !== i - existingImages.length));
                    }
                  }}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {allImages.length < 20 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                ) : (
                  <Plus className="w-5 h-5 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground">
                  {uploading ? "Yüklənir..." : "Əlavə et"}
                </span>
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            İlk şəkil kapaq şəkli olacaq · Maksimum 20 şəkil
          </p>
        </CardContent>
      </Card>

      {/* Video URL */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Video className="w-4 h-4" />
            Video (İxtiyari)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <Label>Video URL</Label>
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              {...register("videoUrl")}
            />
            {errors.videoUrl && (
              <p className="text-xs text-destructive">{errors.videoUrl.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              YouTube və ya Vimeo linkini daxil edin
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Before / After */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Əvvəl / Sonra (İxtiyari)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">
            Layihənin əvvəlki və sonrakı vəziyyətini müqayisə etmək üçün şəkil URL-lərini daxil edin
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Əvvəl Şəkli URL</Label>
              <Input
                placeholder="https://example.com/before.jpg"
                {...register("beforeImage")}
              />
              {errors.beforeImage && (
                <p className="text-xs text-destructive">{errors.beforeImage.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Sonra Şəkli URL</Label>
              <Input
                placeholder="https://example.com/after.jpg"
                {...register("afterImage")}
              />
              {errors.afterImage && (
                <p className="text-xs text-destructive">{errors.afterImage.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Layihə Məlumatları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Layihə Adı *</Label>
            <Input
              placeholder="Xəzər Sahili Villa Kompleksi"
              error={!!errors.title}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Təsvir</Label>
            <Textarea
              placeholder="Layihə haqqında ətraflı məlumat..."
              className="min-h-[100px]"
              {...register("description")}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Kateqoriya *</Label>
              <Select
                value={watch("category")}
                onValueChange={(v) => setValue("category", v)}
              >
                <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                  <SelectValue placeholder="Kateqoriya seçin" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Şəhər</Label>
              <Select
                value={watch("city")}
                onValueChange={(v) => setValue("city", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Şəhər seçin" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Sahə (m²)</Label>
              <Input type="number" placeholder="150" {...register("area")} />
            </div>
            <div className="space-y-1.5">
              <Label>İl</Label>
              <Input
                type="number"
                placeholder={new Date().getFullYear().toString()}
                {...register("year")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Sifarişçi</Label>
              <Input placeholder="Şirkət/şəxs adı" {...register("client")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Etiketlər</Label>
            <Input
              placeholder="minimal, müasir, yaşayış (vergüllə ayırın)"
              {...register("tags")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
          onClick={async () => {
            if (!confirm("Bu layihəni silmək istədiyinizə əminsiniz?")) return;
            const supabase = createClient();
            await supabase.from("portfolioProjects").delete().eq("id", id);
            toast.success("Layihə silindi");
            router.push("/panel/portfolio");
          }}
        >
          <Trash2 className="w-4 h-4" />
          Layihəni Sil
        </Button>
        <div className="flex gap-3">
          <Link href="/panel/portfolio">
            <Button type="button" variant="outline">Ləğv Et</Button>
          </Link>
          <Button type="submit" variant="gradient" size="lg" loading={isSubmitting}>
            Dəyişiklikləri Saxla
          </Button>
        </div>
      </div>
    </form>
  );
}
