"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase";
import {
  Upload,
  X,
  Plus,
  ArrowLeft,
  Building2,
  Image as ImageIcon,
  Loader2,
  Video,
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
import { createPortfolioProject } from "@/server/actions/projects";
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
});

type ProjectForm = z.infer<typeof projectSchema>;

export default function NewPortfolioProjectPage() {
  const router = useRouter();
  const [uploadedImages, setUploadedImages] = useState<
    { url: string; isCover?: boolean }[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectForm>({ resolver: zodResolver(projectSchema) });

  const onSubmit = async (data: ProjectForm) => {
    if (uploadedImages.length === 0) {
      toast.error("Ən az bir şəkil yükləyin");
      return;
    }

    const supabaseAuth = createClient();
    const { data: { session } } = await supabaseAuth.auth.getSession();
    if (!session) {
      toast.error("Giriş tələb olunur");
      return;
    }

    const tags = data.tags
      ? data.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const result = await createPortfolioProject(session.user.id, {
      ...data,
      tags,
      images: uploadedImages.map((img, i) => ({
        url: img.url,
        isCover: i === 0,
      })),
      videoUrl: data.videoUrl || undefined,
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Layihə əlavə edildi!");
      router.push("/panel/portfolio");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = 20 - uploadedImages.length;
    const toUpload = files.slice(0, remaining);

    setUploading(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id ?? "anon";

    const newImages: { url: string }[] = [];
    for (const file of toUpload) {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("portfolio-images")
        .upload(path, file, { upsert: true });
      if (error) {
        toast.error("Şəkil yüklənmədi: " + error.message);
      } else {
        const { data: pub } = supabase.storage
          .from("portfolio-images")
          .getPublicUrl(path);
        newImages.push({ url: pub.publicUrl });
      }
    }
    setUploadedImages((prev) => [...prev, ...newImages]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/panel/portfolio">
          <Button type="button" variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold">Yeni Layihə</h1>
          <p className="text-muted-foreground text-sm">
            Portfolio layihənizi əlavə edin
          </p>
        </div>
        <div className="ml-auto">
          <Button type="submit" variant="gradient" loading={isSubmitting}>
            Yayımla
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
            {uploadedImages.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                <img
                  src={img.url}
                  alt={`Şəkil ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                {i === 0 && (
                  <div className="absolute top-1 left-1 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded">
                    Kapaq
                  </div>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setUploadedImages(uploadedImages.filter((_, j) => j !== i))
                  }
                  className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {uploadedImages.length < 20 && (
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
            İlk şəkil kapaq şəkli olacaq. Maksimum 20 şəkil · JPG, PNG, WebP
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
              <Select onValueChange={(v) => setValue("category", v)}>
                <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                  <SelectValue placeholder="Kateqoriya seçin" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Şəhər</Label>
              <Select onValueChange={(v) => setValue("city", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Şəhər seçin" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
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
              placeholder="minimal, müasir, yaşayış, villa (vergüllə ayırın)"
              {...register("tags")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Link href="/panel/portfolio">
          <Button type="button" variant="outline">
            Ləğv Et
          </Button>
        </Link>
        <Button type="submit" variant="gradient" size="lg" loading={isSubmitting}>
          Layihəni Yayımla
        </Button>
      </div>
    </form>
  );
}
