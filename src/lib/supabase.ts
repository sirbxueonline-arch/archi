import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

type Client = SupabaseClient;

// ───────────────────────────────────────────────────────────────
// Env-less fallback
//
// In dev/preview environments without Supabase env vars, return a
// stub that yields empty results instead of crashing. Public pages
// already handle `null`/empty arrays — they just render their empty
// states or skip the section entirely.
// ───────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const hasPublicEnv = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const hasAdminEnv = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

let warnedPublic = false;
let warnedAdmin = false;

/**
 * Build a chainable thenable that mimics the Supabase query builder
 * but always resolves to `{ data: [], error: null, count: 0 }`.
 *
 * Every query method (select, eq, order, limit, range, in, ilike, gte,
 * lte, etc.) returns the same chainable proxy. Awaiting it (or calling
 * .then) yields the empty result. Auth + state subscriptions return
 * inert objects so the navbar etc. render in the unauthenticated state.
 */
function createStubClient(): Client {
  const emptyResult = { data: [], error: null, count: 0 };

  // The query proxy must be both callable (for methods like .select(...))
  // and chainable (returns itself for .eq(...).order(...)) and thenable
  // (so `await query` resolves to emptyResult).
  const queryProxy: any = new Proxy(function () {}, {
    get(_target, prop) {
      if (prop === "then") {
        return (resolve: (v: unknown) => unknown) => resolve(emptyResult);
      }
      // Every other property returns the same proxy — so `.select` is
      // a callable that returns the proxy, and chains keep working.
      return queryProxy;
    },
    apply() {
      return queryProxy;
    },
  });

  const stub = {
    from: () => queryProxy,
    rpc: () => queryProxy,
    storage: { from: () => queryProxy },
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
      signInWithPassword: async () => ({
        data: { session: null, user: null },
        error: { message: "Supabase not configured" },
      }),
      signUp: async () => ({
        data: { session: null, user: null },
        error: { message: "Supabase not configured" },
      }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
  };

  return stub as unknown as Client;
}

// Singleton browser client
let browserClient: ReturnType<typeof createSupabaseClient> | null = null;

/**
 * Server-only admin client (bypasses RLS via the service role key).
 * If env is missing, returns a stub that yields empty results.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient() must only be called server-side");
  }
  if (!hasAdminEnv) {
    if (!warnedAdmin) {
      console.warn(
        "[supabase] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing — using stub admin client (empty data)."
      );
      warnedAdmin = true;
    }
    return createStubClient();
  }
  return createSupabaseClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
}

/**
 * Public Supabase client (anon key). If env is missing, returns a stub
 * that yields empty results so public pages still render.
 */
export function createClient() {
  if (!hasPublicEnv) {
    if (!warnedPublic) {
      console.warn(
        "[supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing — using stub client (empty data)."
      );
      warnedPublic = true;
    }
    return createStubClient();
  }

  if (typeof window === "undefined") {
    return createSupabaseClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  }

  if (!browserClient) {
    browserClient = createSupabaseClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  }
  return browserClient;
}
