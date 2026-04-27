import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { sendWeeklyDigestToClient, sendWeeklyDigestToProfessional } from "@/lib/email";

// Called by Vercel Cron every Monday at 09:00 Baku time (05:00 UTC)
export async function GET(req: NextRequest) {
  // Verify cron secret
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient();

  // Get users who signed up for digest (all users for now)
  const { data: users } = await supabase
    .from("users")
    .select("id, email, name, role")
    .not("email", "is", null);

  if (!users || users.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  // Get new professionals (joined last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: newPros } = await supabase
    .from("profiles")
    .select("username, specialization, city, user:users!userId(name)")
    .not("username", "like", "musteri_%")
    .gte("createdAt", weekAgo)
    .limit(3);

  // Get open projects (last 7 days)
  const { data: openProjects } = await supabase
    .from("clientProjects")
    .select("id, title, category, city")
    .eq("status", "open")
    .gte("createdAt", weekAgo)
    .limit(5);

  const newProfessionals = (newPros ?? []).map((p: any) => ({
    name: p.user?.name ?? "Memar",
    specialization: p.specialization,
    city: p.city,
    username: p.username,
    avatarImage: null,
  }));

  const projects = (openProjects ?? []).map((p: any) => ({
    id: p.id,
    title: p.title,
    category: p.category ?? "Ümumi",
    city: p.city,
  }));

  let sent = 0;
  for (const user of users) {
    try {
      if (user.role === "professional") {
        // Get their profile views this week
        const { data: profile } = await supabase
          .from("profiles")
          .select("profileViews")
          .eq("userId", user.id)
          .maybeSingle();

        await sendWeeklyDigestToProfessional(
          user.email,
          user.name ?? "Peşəkar",
          projects,
          profile?.profileViews ?? 0,
        );
      } else {
        await sendWeeklyDigestToClient(
          user.email,
          user.name ?? "İstifadəçi",
          newProfessionals,
          projects,
        );
      }
      sent++;
    } catch (err) {
      console.error(`Digest failed for ${user.email}:`, err);
    }
  }

  return NextResponse.json({ sent, professionals: newProfessionals.length, projects: projects.length });
}
