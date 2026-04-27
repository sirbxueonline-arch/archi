"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

const schema = z
  .object({
    password: z.string().min(6, "Şifrə ən az 6 simvol olmalıdır"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifrələr uyğun gəlmir",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

function YeniSifreInner() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const resolveResetSession = async () => {
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      // PKCE-style callback (e.g. ?code=...)
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setInvalidLink(true);
        } else {
          setSessionReady(true);
        }
        return;
      }

      // token_hash callback (e.g. ?token_hash=...&type=recovery)
      if (tokenHash && type === "recovery") {
        const { error } = await supabase.auth.verifyOtp({
          type: "recovery",
          token_hash: tokenHash,
        });
        if (error) {
          setInvalidLink(true);
        } else {
          setSessionReady(true);
        }
        return;
      }

      // Hash fragment callback (e.g. #access_token=...&refresh_token=...)
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          setInvalidLink(true);
        } else {
          setSessionReady(true);
          router.replace("/yeni-sifre");
        }
        return;
      }

      // Already authenticated recovery session
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        setSessionReady(true);
      } else {
        setInvalidLink(true);
      }
    };

    resolveResetSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) {
        toast.error(t("resetPassword.error"));
      } else {
        setSuccess(true);
      }
    } catch {
      toast.error(t("resetPassword.error"));
    } finally {
      setIsLoading(false);
    }
  };

  if (invalidLink) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="font-heading text-2xl font-bold mb-2">{t("resetPassword.invalid.title")}</h2>
        <p className="text-muted-foreground text-sm mb-6">{t("resetPassword.invalid.desc")}</p>
        <Link href="/sifremi-yenile">
          <Button className="w-full">{t("resetPassword.invalid.tryAgain")}</Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="font-heading text-2xl font-bold mb-2">{t("resetPassword.success.title")}</h2>
        <p className="text-muted-foreground text-sm mb-6">{t("resetPassword.success.desc")}</p>
        <Button className="w-full" onClick={() => router.push("/giris")}>
          {t("resetPassword.success.loginBtn")}
        </Button>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">{t("resetPassword.title")}</h1>
        <p className="text-muted-foreground">{t("resetPassword.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">{t("resetPassword.passwordLabel")}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">{t("resetPassword.confirmLabel")}</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t("resetPassword.submitting") : t("resetPassword.submitBtn")}
        </Button>
      </form>
    </div>
  );
}

export default function YeniSifrePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <YeniSifreInner />
    </Suspense>
  );
}
