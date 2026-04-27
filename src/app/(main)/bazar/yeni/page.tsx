"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BriefcaseBusiness, Upload, X, ImageIcon, Loader2 } from "lucide-react";
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
import { toast } from "sonner";
import { CATEGORY_LABELS, BUDGET_RANGE_LABELS, CITIES } from "@/lib/utils";
import { createClientProject } from "@/server/actions/projects";

const schema = z.object({
  title: z.string().min(5, "Ən az 5 simvol"),
  description: z.string().min(20, "Ən az 20 simvol"),
  category: z.string().min(1, "Kateqoriya seçin"),
  city: z.string().optional(),
  area: z.coerce.number().optional(),
  budgetRange: z.string().optional(),
  requirements: z.string().optional(),
  isUrgent: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

export default function NewClientProjectPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/giris?callbackUrl=/bazar/yeni");
      } else {
        setUserId(session.user.id);
      }
      setAuthLoading(false);
    });
  }, [router]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = 8 - uploadedImages.length;
    const toUpload = files.slice(0, remaining);

    setUploading(true);
    const supabase = createClient();
    const uid = userId ?? "anon";

    const newUrls: string[] = [];
    for (const file of toUpload) {
      const ext = file.name.split(".").pop();
      const path = `${uid}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("portfolio-images")
        .upload(path, file, { upsert: true });
      if (error) {
        toast.error("Şəkil yüklənmədi: " + error.message);
      } else {
        const { data: pub } = supabase.storage
          .from("portfolio-images")
          .getPublicUrl(path);
        newUrls.push(pub.publicUrl);
      }
    }

    setUploadedImages((prev) => [...prev, ...newUrls]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idx: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data: FormData) => {
    if (!userId) {
      toast.error("Giriş tələb olunur");
      return;
    }

    const result = await createClientProject(userId, {
      title: data.title,
      description: data.description,
      category: data.category,
      city: data.city,
      area: data.area,
      budgetRange: data.budgetRange,
      requirements: data.requirements,
      isUrgent: data.isUrgent ?? false,
      coverImage: uploadedImages[0],
      referenceImages: uploadedImages.length > 0 ? uploadedImages : undefined,
    });

    if ("error" in result) {
      toast.error(result.error ?? "Xəta baş verdi");
    } else {
      toast.success("Layihə elan edildi!");
      router.push("/bazar");
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/bazar">
            <Button type="button" variant="ghost" size="icon-sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold">Yeni Layihə Elanı</h1>
            <p className="text-muted-foreground text-sm">
              Layihənizi memarlar üçün elan edin
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Main Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Əsas Məlumatlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Layihə Adı *</Label>
                <Input
                  placeholder="Yaşayış evi üçün interyer dizayn"
                  error={!!errors.title}
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Layihə Təsviri *</Label>
                <Textarea
                  placeholder="Layihəniz haqqında ətraflı məlumat verin..."
                  className="min-h-[120px]"
                  error={!!errors.description}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Kateqoriya *</Label>
                  <Select onValueChange={(v) => setValue("category", v)}>
                    <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                      <SelectValue placeholder="Seçin" />
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
                  <Select onValueChange={(v) => setValue("city", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Şəhər seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Sahə (m²)</Label>
                  <Input type="number" placeholder="120" {...register("area")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Büdcə Aralığı</Label>
                  <Select onValueChange={(v) => setValue("budgetRange", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(BUDGET_RANGE_LABELS).map(([v, l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Xüsusi Tələblər</Label>
                <Textarea
                  placeholder="Stil, material, yaxud başqa tələbləriniz..."
                  {...register("requirements")}
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
                <input
                  type="checkbox"
                  id="isUrgent"
                  className="accent-amber-600 w-4 h-4"
                  {...register("isUrgent")}
                />
                <label htmlFor="isUrgent" className="text-sm font-medium text-amber-800 cursor-pointer">
                  🔥 Bu layihə təcilidir
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                İstinad Şəkilləri
                <span className="text-xs font-normal text-muted-foreground">(istəyə bağlı, maks. 8 şəkil)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Image grid */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                  {uploadedImages.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-border">
                      <Image
                        src={url}
                        alt={`Şəkil ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                      {idx === 0 && (
                        <div className="absolute top-1 left-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                          Əsas
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Add more slot */}
                  {uploadedImages.length < 8 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center transition-colors"
                    >
                      {uploading ? (
                        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Upload area (shown when no images yet) */}
              {uploadedImages.length === 0 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full border-2 border-dashed border-border hover:border-primary/40 rounded-xl py-10 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8" />
                  )}
                  <p className="text-sm font-medium">
                    {uploading ? "Yüklənir..." : "Şəkilləri yükləyin"}
                  </p>
                  <p className="text-xs">PNG, JPG, WEBP — maks. 8 şəkil</p>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Link href="/bazar">
              <Button type="button" variant="outline">Ləğv Et</Button>
            </Link>
            <Button type="submit" variant="gradient" size="lg" loading={isSubmitting} disabled={uploading}>
              <BriefcaseBusiness className="w-4 h-4 mr-2" />
              Layihəni Elan Et
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
