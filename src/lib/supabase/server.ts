import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

/**
 * Use this in Server Actions ("use server") to get a Supabase client
 * that can read the user's session from cookies.
 */
export function createActionClient() {
  return createServerActionClient({ cookies });
}
