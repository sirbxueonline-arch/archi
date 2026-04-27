"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

const schema = z.object({
  email: z.string().email("Düzgün email ünvanı daxil edin"),
});

type FormData = z.infer<typeof schema>;

export default function SifremiYenilePage() {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, "");
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${appUrl}/yeni-sifre`,
      });

      if (error) {
        toast.error(t("forgotPassword.error"));
      } else {
        setSentEmail(data.email);
        setSent(true);
      }
    } catch {
      toast.error(t("forgotPassword.error"));
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="font-heading text-2xl font-bold mb-2">{t("forgotPassword.success.title")}</h2>
        <p className="text-muted-foreground text-sm mb-1">{t("forgotPassword.success.desc")}</p>
        <p className="font-medium text-sm mb-4">{sentEmail}</p>
        <p className="text-muted-foreground text-xs mb-6">{t("forgotPassword.success.note")}</p>
        <Link href="/giris">
          <Button variant="outline" className="w-full gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t("forgotPassword.backToLogin")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">{t("forgotPassword.title")}</h1>
        <p className="text-muted-foreground">{t("forgotPassword.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="siz@example.com"
              className="pl-9"
              {...register("email")}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t("forgotPassword.submitting") : t("forgotPassword.submitBtn")}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/giris"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t("forgotPassword.backToLogin")}
        </Link>
      </div>
    </div>
  );
}
