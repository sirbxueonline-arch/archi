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
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

const schema = z.object({
  email: z.string().email("Düzgün email ünvanı daxil edin"),
  password: z.string().min(6, "Şifrə ən az 6 simvol olmalıdır"),
});

type FormData = z.infer<typeof schema>;

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  server_error: "Qeydiyyat zamanı server xətası baş verdi. Zəhmət olmasa bir az sonra yenidən cəhd edin.",
  auth_code_error: "Doğrulama kodu etibarsızdır. Yenidən cəhd edin.",
  auth_token_hash_error: "Doğrulama linki etibarsız və ya müddəti keçmişdir.",
  auth_token_error: "Giriş tokeni etibarsızdır.",
  session_missing: "Sessiya yaradıla bilmədi. Yenidən cəhd edin.",
  no_code: "Doğrulama kodu tapılmadı.",
};

function GirisPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) setAuthError(AUTH_ERROR_MESSAGES[err] ?? "Giriş xətası baş verdi.");
  }, [searchParams]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const { data: loginData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.message === "Email not confirmed") {
          setUnconfirmedEmail(data.email);
        } else {
          toast.error(
            error.message === "Invalid login credentials"
              ? "Email və ya şifrə yanlışdır"
              : error.message || "Giriş xətası"
          );
        }
        setIsLoading(false);
        return;
      }

      if (!loginData.session) {
        toast.error("Sessiya yaradıla bilmədi");
        setIsLoading(false);
        return;
      }

      toast.success("Xoş gəldiniz!");
      setTimeout(() => { window.location.href = "/panel"; }, 1000);
    } catch (err) {
      toast.error("Giriş xətası baş verdi");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth-callback` },
      });
    } catch {
      toast.error("Google giriş xətası");
    }
  };

  const handleResendConfirmation = async () => {
    if (!unconfirmedEmail) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email: unconfirmedEmail });
      if (error) {
        toast.error("Email göndərilmədi, yenidən cəhd edin");
      } else {
        toast.success("Təsdiq emaili yenidən göndərildi!");
      }
    } catch {
      toast.error("Xəta baş verdi");
    } finally {
      setResending(false);
    }
  };

  if (unconfirmedEmail) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="font-heading text-2xl font-bold mb-2">{t("login.unconfirmed.title")}</h2>
        <p className="text-muted-foreground text-sm mb-1">{t("login.unconfirmed.desc")}</p>
        <p className="font-medium text-sm mb-4">{unconfirmedEmail}</p>
        <p className="text-muted-foreground text-xs mb-6">{t("login.unconfirmed.note")}</p>
        <Button onClick={handleResendConfirmation} disabled={resending} className="w-full mb-3">
          {resending ? t("login.unconfirmed.resending") : t("login.unconfirmed.resend")}
        </Button>
        <button
          type="button"
          onClick={() => setUnconfirmedEmail(null)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("login.unconfirmed.back")}
        </button>
      </div>
    );
  }

  return (
    <div>
      {authError && (
        <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3 mb-6 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{authError}</span>
        </div>
      )}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">{t("login.title")}</h1>
        <p className="text-muted-foreground">{t("login.subtitle")}</p>
      </div>

      <Button variant="outline" className="w-full mb-6 gap-3 h-11" onClick={handleGoogleSignIn} disabled={isLoading} type="button">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        {t("login.googleBtn")}
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground">{t("login.orEmail")}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="siz@example.com" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t("login.passwordLabel")}</Label>
            <Link href="/sifremi-yenile" className="text-xs text-primary hover:underline">
              {t("login.forgotPassword")}
            </Link>
          </div>
          <div className="relative">
            <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" {...register("password")} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t("login.submitting") : t("login.submitBtn")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        {t("login.noAccount")}{" "}
        <Link href="/qeydiyyat" className="text-primary font-medium hover:underline">
          {t("login.registerLink")}
        </Link>
      </p>
    </div>
  );
}

export default function GirisPage() {
  return (
    <Suspense fallback={null}>
      <GirisPageInner />
    </Suspense>
  );
}
