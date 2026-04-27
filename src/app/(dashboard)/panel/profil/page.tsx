"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Camera, Save, User, Globe, Phone, Loader2, ImageIcon, Award } from "lucide-react";
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
import {
  SPECIALIZATION_LABELS,
  CITIES,
  EXPERIENCE_LEVEL_LABELS,
  getInitials,
} from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Minimum 3 simvol")
    .max(50)
    .regex(/^[a-z0-9_.]+$/, "Yalnız kiçik hərflər, rəqəmlər, alt xətt və nöqtə"),
  bio: z.string().max(500).optional(),
  tagline: z.string().max(100).optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url("Düzgün URL daxil edin").optional().or(z.literal("")),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),
  specialization: z.string().optional(),
  experienceYears: z.coerce.number().min(0).max(50).optional(),
  experienceLevel: z.string().optional(),
  isAvailable: z.boolean().default(true),
  hourlyRate: z.coerce.number().min(0).optional(),
  minProjectBudget: z.coerce.number().min(0).optional(),
  studioName: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfileEditPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [certificates, setCertificates] = useState<string[]>([]);
  const [uploadingCert, setUploadingCert] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { isAvailable: true },
  });

  const specialization = watch("specialization");
  const isAvailable = watch("isAvailable");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      const uid = session.user.id;
      setUserId(uid);
      setUserName(session.user.user_metadata?.name ?? session.user.email ?? "");

      // Ensure public users row exists — read current role first so we never overwrite it
      // (user_metadata.role is unreliable for OAuth users; source of truth is the users table)
      const { data: existingUserRow } = await supabase
        .from("users")
        .select("role")
        .eq("id", uid)
        .maybeSingle();
      await supabase.from("users").upsert({
        id: uid,
        email: session.user.email!,
        name: session.user.user_metadata?.name ?? "",
        role: existingUserRow?.role ?? session.user.user_metadata?.role ?? "client",
      }, { onConflict: "id" });

      // Load existing profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("userId", uid)
        .maybeSingle();

      if (profile) {
        setProfileExists(true);
        setAvatarUrl(profile.avatarImage ?? undefined);
        setCoverImageUrl(profile.coverImage ?? undefined);
        setCertificates((profile.certificates as string[] | null) ?? []);
        reset({
          username: profile.username ?? "",
          bio: profile.bio ?? "",
          tagline: profile.tagline ?? "",
          city: profile.city ?? "",
          phone: profile.phone ?? "",
          website: profile.website ?? "",
          instagram: profile.instagram ?? "",
          linkedin: profile.linkedin ?? "",
          specialization: profile.specialization ?? "",
          experienceYears: profile.experienceYears ?? 0,
          experienceLevel: profile.experienceLevel ?? "",
          isAvailable: profile.isAvailable ?? true,
          hourlyRate: profile.hourlyRate ?? undefined,
          minProjectBudget: profile.minProjectBudget ?? undefined,
          studioName: profile.studioName ?? "",
        });
      }
      setLoading(false);
    };
    load();
  }, [reset]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploadingAvatar(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("portfolio-images")
      .upload(path, file, { upsert: true });
    if (error) {
      // Show preview locally even if storage failed
      setAvatarUrl(URL.createObjectURL(file));
      toast.error(t("profil.photo.warn"));
    } else {
      const { data: pub } = supabase.storage.from("portfolio-images").getPublicUrl(path);
      setAvatarUrl(pub.publicUrl);
      // Only update DB if profile row already exists; otherwise it will be saved on form submit
      if (profileExists) {
        await supabase
          .from("profiles")
          .update({ avatarImage: pub.publicUrl, updatedAt: new Date().toISOString() })
          .eq("userId", userId);
      }
      // Sync to users table (sidebar reads this) and auth metadata
      await supabase.from("users").update({ image: pub.publicUrl }).eq("id", userId);
      await supabase.auth.updateUser({ data: { avatar_url: pub.publicUrl } });
      window.dispatchEvent(new CustomEvent("archilink:avatar-updated", { detail: pub.publicUrl }));
      toast.success(t("profil.photo.updated"));
    }
    setUploadingAvatar(false);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploadingCover(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${userId}/cover-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("portfolio-images")
      .upload(path, file, { upsert: true });
    if (error) {
      setCoverImageUrl(URL.createObjectURL(file));
      toast.error("Banner yüklənmədi");
    } else {
      const { data: pub } = supabase.storage.from("portfolio-images").getPublicUrl(path);
      setCoverImageUrl(pub.publicUrl);
      if (profileExists) {
        await supabase
          .from("profiles")
          .update({ coverImage: pub.publicUrl, updatedAt: new Date().toISOString() })
          .eq("userId", userId);
      }
      toast.success("Banner yeniləndi");
    }
    setUploadingCover(false);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploadingCert(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${userId}/cert-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("portfolio-images")
      .upload(path, file, { upsert: true });
    if (error) {
      toast.error("Sertifikat yüklənmədi");
    } else {
      const { data: pub } = supabase.storage.from("portfolio-images").getPublicUrl(path);
      const newCerts = [...certificates, pub.publicUrl];
      setCertificates(newCerts);
      if (profileExists) {
        await supabase
          .from("profiles")
          .update({ certificates: newCerts, updatedAt: new Date().toISOString() })
          .eq("userId", userId);
      }
      toast.success("Sertifikat əlavə edildi");
    }
    setUploadingCert(false);
    if (certInputRef.current) certInputRef.current.value = "";
  };

  const removeCertificate = async (url: string) => {
    if (!userId) return;
    const newCerts = certificates.filter((c) => c !== url);
    setCertificates(newCerts);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ certificates: newCerts, updatedAt: new Date().toISOString() })
      .eq("userId", userId);
  };

  const onSubmit = async (data: ProfileForm) => {
    if (!userId) return;
    const supabase = createClient();

    // Check username uniqueness
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", data.username)
      .neq("userId", userId)
      .maybeSingle();
    if (existing) {
      toast.error("Bu istifadəçi adı artıq mövcuddur");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({
        ...data,
        userId,
        avatarImage: avatarUrl ?? null,
        coverImage: coverImageUrl ?? null,
        certificates: certificates.length > 0 ? certificates : null,
        website: data.website || null,
        specialization: data.specialization || null,
        experienceLevel: data.experienceLevel || null,
        city: data.city || null,
        updatedAt: new Date().toISOString(),
      }, { onConflict: "userId" });

    if (error) {
      toast.error(error.message);
    } else {
      setProfileExists(true);
      // Sync avatar to users table (sidebar reads this) and auth metadata
      if (avatarUrl) {
        await supabase.from("users").update({ image: avatarUrl }).eq("id", userId);
        await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } });
      }
      toast.success(t("profil.toast.saved"));
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">{t("profil.title")}</h1>
        <p className="text-muted-foreground text-sm">{t("profil.subtitle")}</p>
      </div>

      {/* Avatar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("profil.photo.title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
              {uploadingAvatar ? (
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              ) : avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar" width={80} height={80} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary">{getInitials(userName || "U")}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-sm hover:bg-primary/80 transition-colors"
            >
              <Camera className="w-3 h-3" />
            </button>
          </div>
          <div>
            <p className="font-medium text-sm mb-1">{t("profil.photo.upload")}</p>
            <p className="text-xs text-muted-foreground mb-2">{t("profil.photo.hint")}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar}>
              {uploadingAvatar ? (
                <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{t("profil.photo.uploading")}</>
              ) : t("profil.photo.choose")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cover/Banner */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Profil Banneri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverChange}
          />
          <div
            className="relative w-full h-36 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 border border-border cursor-pointer group"
            onClick={() => coverInputRef.current?.click()}
          >
            {uploadingCover ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              </div>
            ) : coverImageUrl ? (
              <Image src={coverImageUrl} alt="Banner" fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                <ImageIcon className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">Banner şəkli yoxdur</p>
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex items-center gap-2 bg-white/90 text-sm font-medium px-3 py-1.5 rounded-lg shadow">
                <Camera className="w-4 h-4" />
                Banner dəyiş
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Tövsiyə olunan ölçü: 1200×400 px. Maks. 5 MB.</p>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />
            {t("profil.basic.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t("profil.basic.username")} *</Label>
              <Input placeholder="kamran.aliyev" error={!!errors.username} {...register("username")} />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
              <p className="text-xs text-muted-foreground">
                archilink.az/memarlar/<span className="font-medium">{watch("username")}</span>
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>{t("profil.basic.tagline")}</Label>
              <Input placeholder={t("profil.basic.tagline.placeholder")} {...register("tagline")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t("profil.basic.bio")}</Label>
            <Textarea placeholder={t("profil.basic.bio.placeholder")} className="min-h-[100px]" {...register("bio")} />
            <p className="text-xs text-muted-foreground text-right">{watch("bio")?.length ?? 0}/500</p>
          </div>
        </CardContent>
      </Card>

      {/* Professional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("profil.pro.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t("profil.pro.specialization")}</Label>
              <Select value={specialization} onValueChange={(v) => setValue("specialization", v, { shouldDirty: true })}>
                <SelectTrigger>
                  <SelectValue placeholder={t("profil.pro.specialization.placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SPECIALIZATION_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("profil.pro.experience")}</Label>
              <Select value={watch("experienceLevel")} onValueChange={(v) => setValue("experienceLevel", v, { shouldDirty: true })}>
                <SelectTrigger>
                  <SelectValue placeholder={t("profil.pro.experience.placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EXPERIENCE_LEVEL_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t("profil.pro.years")}</Label>
              <Input type="number" min={0} max={50} placeholder="0" {...register("experienceYears")} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("profil.pro.city")}</Label>
              <Select value={watch("city")} onValueChange={(v) => setValue("city", v, { shouldDirty: true })}>
                <SelectTrigger>
                  <SelectValue placeholder={t("profil.pro.city.placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div>
              <p className="font-medium text-sm">{t("profil.pro.available")}</p>
              <p className="text-xs text-muted-foreground">{t("profil.pro.available.desc")}</p>
            </div>
            <div
              onClick={() => setValue("isAvailable", !isAvailable, { shouldDirty: true })}
              className={`w-12 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 relative select-none ${isAvailable ? "bg-primary" : "bg-slate-300"}`}
            >
              <span className={`absolute top-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${isAvailable ? "left-[26px]" : "left-[2px]"}`} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Saatlıq tarif (AZN)</Label>
              <Input type="number" min={0} placeholder="0" {...register("hourlyRate")} />
            </div>
            <div className="space-y-1.5">
              <Label>Layihə minimum büdcəsi (AZN)</Label>
              <Input type="number" min={0} placeholder="0" {...register("minProjectBudget")} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="w-4 h-4" />
            {t("profil.contact.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t("profil.contact.phone")}</Label>
              <Input placeholder="+994 50 000 00 00" {...register("phone")} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("profil.contact.website")}</Label>
              <Input placeholder="https://example.com" startIcon={<Globe className="w-4 h-4" />} error={!!errors.website} {...register("website")} />
            </div>
            <div className="space-y-1.5">
              <Label>Instagram</Label>
              <Input placeholder="username" {...register("instagram")} />
            </div>
            <div className="space-y-1.5">
              <Label>LinkedIn</Label>
              <Input placeholder="username" {...register("linkedin")} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4" />
            Sertifikatlar və Diplomlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={certInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleCertificateUpload}
          />
          {certificates.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {certificates.map((url, idx) => (
                <div key={idx} className="relative group">
                  {url.endsWith(".pdf") ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center h-24 rounded-xl border border-border bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <div className="text-center">
                        <Award className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">PDF {idx + 1}</p>
                      </div>
                    </a>
                  ) : (
                    <img src={url} alt={`Sertifikat ${idx + 1}`} className="w-full h-24 object-cover rounded-xl border border-border" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeCertificate(url)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => certInputRef.current?.click()}
            disabled={uploadingCert}
            className="gap-1.5"
          >
            {uploadingCert ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" />Yüklənir...</>
            ) : (
              <><Camera className="w-3.5 h-3.5" />Sertifikat əlavə et</>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">PNG, JPG və ya PDF. Maks. 5 MB.</p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" variant="gradient" size="lg" loading={isSubmitting}>
          <Save className="w-4 h-4 mr-2" />
          {t("profil.save.btn")}
        </Button>
      </div>
    </form>
  );
}
