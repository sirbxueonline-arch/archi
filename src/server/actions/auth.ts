"use server";

// Auth is handled by Supabase on the client side.
// Use supabase.auth.signUp() and supabase.auth.signInWithPassword() in client components.

import { sendWelcomeEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase";

/**
 * Sends a welcome email after a new user is created.
 * Called from client-side registration flow after Supabase signUp succeeds.
 */
export async function triggerWelcomeEmail(
  to: string,
  name: string,
  role: "professional" | "client"
) {
  try {
    await sendWelcomeEmail(to, name, role);
  } catch {
    // Email errors should not affect registration flow
  }
}

/**
 * Creates/upserts a user record in public.users using the admin client (bypasses RLS).
 * Called from client-side registration flow after Supabase signUp succeeds.
 */
export async function createUserRecord(
  id: string,
  email: string,
  name: string,
  role: "professional" | "client"
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();
    // ignoreDuplicates: true means if a row with this id already exists,
    // do nothing — preserving the existing role and data (prevents overwrite on re-signup)
    const { error } = await supabase.from("users").upsert(
      { id, email, name, role },
      { onConflict: "id", ignoreDuplicates: true }
    );
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: "İstifadəçi yaradılarkən xəta baş verdi" };
  }
}
