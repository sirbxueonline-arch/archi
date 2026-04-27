"use server";

import { createAdminClient } from "@/lib/supabase";

export async function deleteAccount(userId: string): Promise<{ error?: string }> {
  if (!userId) return { error: "İstifadəçi tapılmadı" };

  const supabase = createAdminClient();

  // Delete user record from users table — cascade will clean up related rows
  const { error: deleteError } = await supabase
    .from("users")
    .delete()
    .eq("id", userId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  // Sign out the user after deletion
  await supabase.auth.signOut();

  return {};
}
