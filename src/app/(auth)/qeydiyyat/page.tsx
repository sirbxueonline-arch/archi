"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import { triggerWelcomeEmail, createUserRecord } from "@/server/actions/auth";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

const registerSchema = z
  .object({
    name: z.string().min(2, "Ad ən az 2 simvol olmalıdır"),
    email: z.string().email("Düzgün email daxil edin"),
    password: z.string().min(8, "Şifrə ən az 8 simvol olmalıdır"),
    confirmPassword: z.string(),
    role: z.enum(["professional", "client"]),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Şifrələr uyğun gəlmir",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const supabase = createClient();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "professional" },
  });

  const selectedRole = watch("role");

  const roles = [
    { value: "professional" as const, icon: Building2, label: t("register.roleProLabel"), desc: t("register.roleProDesc") },
    { value: "client" as const, icon: Users, label: t("register.roleClientLabel"), desc: t("register.roleClientDesc") },
  ];

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { name: data.name, role: data.role } },
      });

      if (signUpError) {
        toast.error(
          signUpError.message === "User already registered"
            ? "Bu email ilə hesab artıq mövcuddur"
            : signUpError.message || "Qeydiyyat xətası"
        );
        setIsLoading(false);
        return;
      }

      // Fire background tasks without blocking the redirect
      if (signUpData.user) {
        createUserRecord(signUpData.user.id, data.email, data.name, data.role).catch(() => {});
        triggerWelcomeEmail(data.email, data.name, data.role).catch(() => {});
      }

      toast.success("Hesab uğurla yaradıldı!");
      const redirectPath = data.role === "professional" ? "/qeydiyyat/tamamla" : "/qeydiyyat/musteri-tamamla";
      setIsLoading(false);
      setTimeout(() => { window.location.href = redirectPath; }, 800);
    } catch {
      toast.error("Qeydiyyat xətası baş verdi");
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      // Persist the selected role so auth-callback can assign it correctly
      localStorage.setItem("archilink_oauth_role", selectedRole);
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth-callback?flow=signup`,
        },
      });
    } catch {
      toast.error("Google qeydiyyat xətası");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold mb-2">{t("register.title")}</h1>
        <p className="text-muted-foreground text-sm">{t("register.subtitle")}</p>
      </div>

      {/* Role Selection */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {roles.map((role) => (
          <button
            key={role.value}
            type="button"
            onClick={() => setValue("role", role.value)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
              selectedRole === role.value
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:border-primary/30 text-muted-foreground"
            )}
          >
            <role.icon className="w-6 h-6" />
            <div>
              <p className="font-semibold text-sm">{role.label}</p>
              <p className="text-xs opacity-70">{role.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Google Sign Up */}
      <Button variant="outline" className="w-full mb-5 gap-3 h-11" onClick={handleGoogleSignUp} disabled={isLoading} type="button">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        {t("register.googleBtn")}
      </Button>

      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground">{t("register.orEmail")}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">{t("register.nameLabel")}</Label>
          <Input id="name" placeholder="Kamran Əliyev" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="siz@example.com" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">{t("register.passwordLabel")}</Label>
          <div className="relative">
            <Input id="password" type={showPassword ? "text" : "password"} placeholder={t("register.minPassword")} {...register("password")} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">{t("register.confirmLabel")}</Label>
          <Input id="confirmPassword" type={showPassword ? "text" : "password"} placeholder={t("register.confirmPlaceholder")} {...register("confirmPassword")} />
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t("register.submitting") : t("register.submitBtn")}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground mt-4">
        {t("register.termsPrefix")}{" "}
        <Link href="/sertler" className="text-primary hover:underline">{t("register.termsLink")}</Link>
        {" "}{t("register.termsSuffix")}
      </p>

      <p className="text-center text-sm text-muted-foreground mt-4">
        {t("register.hasAccount")}{" "}
        <Link href="/giris" className="text-primary font-medium hover:underline">
          {t("register.loginLink")}
        </Link>
      </p>
    </div>
  );
}
