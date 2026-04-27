import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Supabase stores session in localStorage (client-side), not cookies.
// Auth protection is handled client-side in the dashboard layout.
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
