"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    const handleOAuthCallback = async () => {
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");
      const queryError = searchParams.get("error");
      const flow = searchParams.get("flow");
      let session = null as Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"];

      if (queryError) {
        router.push(`/giris?error=${encodeURIComponent(queryError)}`);
        return;
      }

      // PKCE callback (?code=...)
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error || !data.session) {
          router.push("/giris?error=auth_code_error");
          return;
        }
        session = data.session;
      } else if (tokenHash && type) {
        // Token-hash callback (used by some providers/flows)
        const { data, error } = await supabase.auth.verifyOtp({
          type: type as any,
          token_hash: tokenHash,
        });
        if (error || !data.session) {
          router.push("/giris?error=auth_token_hash_error");
          return;
        }
        session = data.session;
      } else {
        // Hash callback (#access_token=...&refresh_token=...)
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const hashError = hashParams.get("error");
        if (hashError) {
          router.push(`/giris?error=${encodeURIComponent(hashError)}`);
          return;
        }
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error || !data.session) {
            router.push("/giris?error=auth_token_error");
            return;
          }
          session = data.session;
          router.replace("/auth-callback");
        } else {
          // Some providers establish session asynchronously via storage/cookie.
          // Wait briefly before failing, so we don't show false "no_code".
          for (let i = 0; i < 10; i += 1) {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
              session = data.session;
              break;
            }
            await new Promise((resolve) => setTimeout(resolve, 250));
          }
          if (!session) {
            router.push("/giris?error=no_code");
            return;
          }
        }
      }

      if (!session) {
        router.push("/giris?error=session_missing");
        return;
      }

      const userId = session.user.id;
      const name = session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? "";
      const email = session.user.email ?? "";
      const pendingRole = localStorage.getItem("archilink_oauth_role");
      const selectedRole =
        pendingRole === "professional" || pendingRole === "client"
          ? pendingRole
          : null;

      // If this callback came from signup flow, consume and clear the role hint.
      if (flow === "signup") {
        localStorage.removeItem("archilink_oauth_role");
      }

      // Keep existing role if user row already exists.
      const { data: existingUser } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      const isNewUser = !existingUser;

      if (isNewUser) {
        // New user — assign a role
        const roleToPersist =
          (session.user.user_metadata?.role as string | undefined) ??
          selectedRole ??
          "client";
        await supabase.from("users").insert(
          { id: userId, email, name, role: roleToPersist }
        );
      } else {
        // Existing user — update name/email but explicitly preserve the stored role
        // (guards against any DB trigger that might reset role to "client")
        const currentRole = existingUser.role;
        await supabase.from("users")
          .update({ email, name, role: currentRole })
          .eq("id", userId);
      }

      // Check if profile already exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("userId", userId)
        .maybeSingle();

      if (profile) {
        router.push("/panel");
        return;
      }

      // No profile yet — always pick role first
      router.push("/qeydiyyat/rol-sec");
    };

    handleOAuthCallback();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm">Daxil olunur...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <AuthCallbackInner />
    </Suspense>
  );
}
