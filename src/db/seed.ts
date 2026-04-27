import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import {
  users,
  profiles,
  skills,
  portfolioProjects,
  projectImages,
  clientProjects,
  verificationBadges,
  reviews,
} from "./schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function seed() {
  console.log("🌱 Seed data yüklənir...");

  // ── Skills ──────────────────────────────────────────────────────────────────
  const skillData = [
    { name: "AutoCAD", slug: "autocad", category: "software" },
    { name: "ArchiCAD", slug: "archicad", category: "software" },
    { name: "Revit (BIM)", slug: "revit", category: "software" },
    { name: "SketchUp", slug: "sketchup", category: "software" },
    { name: "3ds Max", slug: "3ds-max", category: "software" },
    { name: "V-Ray", slug: "vray", category: "software" },
    { name: "Rhino", slug: "rhino", category: "software" },
    { name: "Grasshopper", slug: "grasshopper", category: "software" },
    { name: "Lumion", slug: "lumion", category: "software" },
    { name: "Adobe Photoshop", slug: "photoshop", category: "software" },
    { name: "Minimalist Dizayn", slug: "minimalist", category: "style" },
    { name: "Müasir Memarlıq", slug: "modern", category: "style" },
    { name: "Klassik Memarlıq", slug: "classical", category: "style" },
    { name: "Bioklimatik Dizayn", slug: "bioclimatic", category: "style" },
    { name: "Davamlılıq", slug: "sustainability", category: "expertise" },
    { name: "Yaşayış Binaları", slug: "residential", category: "expertise" },
    { name: "Kommersiya", slug: "commercial", category: "expertise" },
    { name: "İnteryer", slug: "interior", category: "expertise" },
    { name: "Landşaft", slug: "landscape", category: "expertise" },
    { name: "Urban Planlama", slug: "urban-planning", category: "expertise" },
  ];

  await db.insert(skills).values(skillData).onConflictDoNothing();
  console.log("✅ Skills əlavə edildi");

  // ── Professional Users ───────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 12);

  const professionalsData = [
    {
      name: "Kamran Əliyev",
      email: "kamran@archilink.az",
      username: "kamran.aliyev",
      bio: "12 illik təcrübəyə malik baş memar. Yaşayış binalarında, kommersiya obyektlərində və mədəni mərkəzlərdə 80-dən çox layihəni uğurla həyata keçirmişəm. Minimalist və müasir dizayn anlayışını davamlı memarlıq prinsipləri ilə birləşdirirəm.",
      tagline: "Müasir memarlığı yaşayış məkanlarına daşıyan baş memar",
      specialization: "architect" as const,
      city: "Bakı",
      experienceYears: 12,
      experienceLevel: "principal" as const,
      hourlyRate: 80,
      isAvailable: true,
      instagram: "kamran_architect",
      website: "https://kamran-architect.az",
      avatarImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      coverImage: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80",
    },
    {
      name: "Leyla Hüseynova",
      email: "leyla@archilink.az",
      username: "leyla.huseynova",
      bio: "7 illik interyer dizayn təcrübəsi. Lüks villalar, premium restoran və otel dizaynlarında mütəxəssisəm. Minimalist estetika ilə funksionallığı üzvi şəkildə birləşdirirəm.",
      tagline: "Lüks yaşayış məkanları üçün interyer dizayneri",
      specialization: "interior_designer" as const,
      city: "Bakı",
      experienceYears: 7,
      experienceLevel: "senior" as const,
      hourlyRate: 65,
      isAvailable: true,
      instagram: "leyla_interior",
      avatarImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
      coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    },
    {
      name: "Nihad Rəsulzadə",
      email: "nihad@archilink.az",
      username: "nihad.rasulzade",
      bio: "Urban planlama və şəhər dizaynı üzrə 9 illik iş təcrübəsi. Bakı metropoliten ərazisinin inkişaf planlamasında iştirak etmişəm.",
      tagline: "Urban dizayner və şəhər planlaması mütəxəssisi",
      specialization: "urban_designer" as const,
      city: "Bakı",
      experienceYears: 9,
      experienceLevel: "senior" as const,
      hourlyRate: 70,
      isAvailable: true,
      avatarImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
      coverImage: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80",
    },
    {
      name: "Aytən Məmmədova",
      email: "ayten@archilink.az",
      username: "ayten.mammadova",
      bio: "Landşaft memarlığı üzrə ixtisaslaşmış, 6 illik təcrübəyə malik dizayner. Bağ-park dizaynları, yaşıllıq konsepsiyaları və açıq məkan planlamasında uğurlu layihələr həyata keçirmişəm.",
      tagline: "Landşaft memarlığı üzrə mütəxəssis",
      specialization: "landscape_designer" as const,
      city: "Gəncə",
      experienceYears: 6,
      experienceLevel: "mid" as const,
      hourlyRate: 55,
      isAvailable: true,
      avatarImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
      coverImage: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&q=80",
    },
    {
      name: "AzArch Dizayn Studiyası",
      email: "studio@azarch.az",
      username: "azarch-studio",
      bio: "AzArch – 2015-ci ildən fəaliyyət göstərən Azərbaycanın aparıcı dizayn studiyalarından biri. 15 nəfərlik komandamız memarlıq, interyer və brending xidmətlərini kompleks şəkildə həyata keçirir.",
      tagline: "Kompleks memarlıq və dizayn xidmətləri",
      specialization: "studio" as const,
      studioName: "AzArch Dizayn Studiyası",
      teamSize: 15,
      city: "Bakı",
      experienceYears: 9,
      experienceLevel: "principal" as const,
      hourlyRate: 120,
      isAvailable: true,
      website: "https://azarch.az",
      instagram: "azarch_studio",
      coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
    },
  ];

  for (const profData of professionalsData) {
    const [user] = await db
      .insert(users)
      .values({ name: profData.name, email: profData.email, passwordHash, role: "professional" })
      .onConflictDoNothing()
      .returning();

    if (!user) continue;

    const {
      name,
      email,
      username,
      avatarImage,
      studioName,
      teamSize,
      ...profileRest
    } = profData;

    await db
      .insert(profiles)
      .values({ userId: user.id, username, avatarImage, studioName, teamSize, ...profileRest })
      .onConflictDoNothing();
  }

  console.log("✅ Professional istifadəçilər əlavə edildi");

  // ── Client User ─────────────────────────────────────────────────────────────
  const [clientUser] = await db
    .insert(users)
    .values({
      name: "Rauf Qarayev",
      email: "rauf@example.az",
      passwordHash,
      role: "client",
    })
    .onConflictDoNothing()
    .returning();

  if (clientUser) {
    await db
      .insert(profiles)
      .values({ userId: clientUser.id, username: "rauf.qarayev" })
      .onConflictDoNothing();
  }

  console.log("✅ Müştəri istifadəçi əlavə edildi");

  // ── Portfolio Projects ────────────────────────────────────────────────────
  const kamranProfile = await db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.username, "kamran.aliyev"),
  });

  if (kamranProfile) {
    const portfolioData = [
      {
        title: "Xəzər Sahili Villa Kompleksi",
        description:
          "Bakı ətrafında, Xəzər sahilindəki bu villa kompleksi müasir Azərbaycan memarlığının ən yaxşı nümunəsidir. Hər villa öz özəl hovuzu, bağı və panoramik dəniz mənzərəsi ilə diqqəti cəlb edir.",
        category: "architecture" as const,
        city: "Bakı",
        location: "Bakı, Pirəkəşkül",
        latitude: 40.5567,
        longitude: 49.5677,
        area: 8500,
        year: 2024,
        client: "Xəzər Qruppu",
        coverImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
        isFeatured: true,
        tags: ["villa", "sahil", "lüks", "müasir"],
      },
      {
        title: "Azneft Meydan Rekonstruksiyası",
        description:
          "Bakının tarixi mərkəzindəki Azneft Meydanının tam rekonstruksiyası. Müasir infrastruktur, yaşıllıq zonaları və mədəni mərkəzin inteqrasiyası.",
        category: "urban" as const,
        city: "Bakı",
        location: "Bakı, Neft Daşları",
        latitude: 40.3777,
        longitude: 49.8541,
        area: 12000,
        year: 2023,
        client: "Bakı Şəhər İdarəsi",
        coverImage: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
        isFeatured: true,
        tags: ["urban", "meydan", "rekonstruksiya", "ictimai"],
      },
    ];

    for (const pd of portfolioData) {
      const [project] = await db
        .insert(portfolioProjects)
        .values({ ...pd, profileId: kamranProfile.id, slug: `${pd.title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}` })
        .returning();

      if (project) {
        await db.insert(projectImages).values([
          { portfolioProjectId: project.id, url: pd.coverImage, order: 0, isCover: true },
          {
            portfolioProjectId: project.id,
            url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
            order: 1,
          },
        ]);
      }
    }

    // Badges
    await db.insert(verificationBadges).values([
      { profileId: kamranProfile.id, badge: "verified_architect" },
      { profileId: kamranProfile.id, badge: "top_portfolio" },
    ]).onConflictDoNothing();
  }

  const leylaProfile = await db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.username, "leyla.huseynova"),
  });

  if (leylaProfile) {
    const [project] = await db
      .insert(portfolioProjects)
      .values({
        profileId: leylaProfile.id,
        title: "Minimalist Loft Studiya",
        slug: "minimalist-loft-studiya-" + Date.now(),
        description:
          "Nərimanov rayonundakı bu loft interyer onun sahibinin yaradıcı həyat tərzi üçün xüsusi olaraq dizayn edilib.",
        category: "interior",
        city: "Bakı",
        location: "Bakı, Nərimanov",
        latitude: 40.4158,
        longitude: 49.8728,
        area: 85,
        year: 2024,
        coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
        isFeatured: true,
        tags: ["minimalist", "loft", "interyer"],
      })
      .returning();

    if (project) {
      await db.insert(projectImages).values([
        { portfolioProjectId: project.id, url: project.coverImage!, order: 0, isCover: true },
      ]);
    }

    await db.insert(verificationBadges).values([
      { profileId: leylaProfile.id, badge: "verified_architect" },
    ]).onConflictDoNothing();
  }

  console.log("✅ Portfolio layihələri əlavə edildi");

  // ── Client Projects ───────────────────────────────────────────────────────────
  if (clientUser) {
    await db.insert(clientProjects).values([
      {
        clientId: clientUser.id,
        title: "3 Otaqlı Mənzil İnteryer Dizaynı",
        description:
          "Nərimanov rayonunda 3 otaqlı, 120 m² mənzil üçün tam interyer dizayn xidməti axtarıram. Minimalist üslub üstünlük təşkil etməlidir.",
        category: "interior",
        city: "Bakı",
        area: 120,
        budgetRange: "15k_50k",
        budgetMin: 15000,
        budgetMax: 35000,
        requirements: "Minimalist üslub, açıq planlaşma, çoxlu işıqlandırma",
        isUrgent: false,
        status: "open",
      },
      {
        clientId: clientUser.id,
        title: "Həyət Bağı Landşaft Dizaynı",
        description:
          "Mənimlə 400 m² həyət sahəsi üçün landşaft dizayn layihəsi hazırlamaq istəyirəm. Su elementi, istirahət zolağı və bitkiçilik əsas tələblərdir.",
        category: "landscape",
        city: "Bakı",
        area: 400,
        budgetRange: "5k_15k",
        requirements: "Su elementi, pergola, bitkiçilik, istirahət",
        isUrgent: true,
        status: "open",
      },
    ]).onConflictDoNothing();

    console.log("✅ Müştəri layihələri əlavə edildi");
  }

  // ── Reviews ──────────────────────────────────────────────────────────────────
  if (kamranProfile && clientUser) {
    await db.insert(reviews).values([
      {
        reviewerId: clientUser.id,
        profileId: kamranProfile.id,
        rating: 5,
        title: "Mükəmməl iş keyfiyyəti",
        content:
          "Kamran bəy layihəmizi vaxtında və gözləntilərimizi aşan keyfiyyətdə tamamladı. Peşəkarlığı, ünsiyyəti və yaradıcı yanaşması sayəsində proses çox rahat keçdi.",
        isVerified: true,
        isPublished: true,
      },
    ]).onConflictDoNothing();

    // Update rating
    await db.update(profiles)
      .set({ averageRating: 5.0, totalReviews: 1, totalProjects: 85 })
      .where(eq(profiles.id, kamranProfile.id));
  }

  console.log("✅ Rəylər əlavə edildi");
  console.log("\n🎉 Seed data uğurla yükləndi!\n");
  console.log("Demo hesablar:");
  console.log("  Memar: kamran@archilink.az / password123");
  console.log("  Müştəri: rauf@example.az / password123");

  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed xətası:", err);
  process.exit(1);
});
