import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uuid,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
type AdapterAccount = { type: "oauth" | "email" | "credentials" | "webauthn" };

// ─────────────────────────── ENUMS ───────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["professional", "client", "admin"]);

export const specializationEnum = pgEnum("specialization", [
  "architect",
  "interior_designer",
  "landscape_designer",
  "urban_designer",
  "student",
  "studio",
]);

export const projectCategoryEnum = pgEnum("project_category", [
  "architecture",
  "interior",
  "landscape",
  "urban",
  "renovation",
  "commercial",
  "residential",
  "mixed_use",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "open",
  "in_progress",
  "completed",
  "cancelled",
]);

export const proposalStatusEnum = pgEnum("proposal_status", [
  "pending",
  "accepted",
  "rejected",
  "withdrawn",
]);

export const verificationBadgeEnum = pgEnum("verification_badge", [
  "verified_architect",
  "verified_studio",
  "top_portfolio",
  "projects_10",
  "featured",
]);

export const budgetRangeEnum = pgEnum("budget_range", [
  "under_5k",
  "5k_15k",
  "15k_50k",
  "50k_100k",
  "over_100k",
]);

export const experienceLevelEnum = pgEnum("experience_level", [
  "junior",
  "mid",
  "senior",
  "principal",
]);

export const availabilityStatusEnum = pgEnum("availability_status", [
  "available",
  "busy",
  "vacation",
]);

// ─────────────────────────── AUTH TABLES ─────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("passwordHash"),
  role: userRoleEnum("role").notNull().default("client"),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationTokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// ─────────────────────────── PROFILES ────────────────────────────────────────

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    username: varchar("username", { length: 100 }).notNull().unique(),
    bio: text("bio"),
    tagline: varchar("tagline", { length: 255 }),
    city: varchar("city", { length: 100 }),
    country: varchar("country", { length: 100 }).default("Azərbaycan"),
    phone: varchar("phone", { length: 20 }),
    website: varchar("website", { length: 255 }),
    instagram: varchar("instagram", { length: 100 }),
    linkedin: varchar("linkedin", { length: 100 }),
    specialization: specializationEnum("specialization"),
    experienceYears: integer("experienceYears").default(0),
    experienceLevel: experienceLevelEnum("experienceLevel"),
    isAvailable: boolean("isAvailable").notNull().default(true),
    hourlyRate: integer("hourlyRate"),
    minProjectBudget: integer("minProjectBudget"),
    coverImage: text("coverImage"),
    avatarImage: text("avatarImage"),
    // Studio specific
    studioName: varchar("studioName", { length: 255 }),
    teamSize: integer("teamSize"),
    // Scores
    averageRating: real("averageRating").default(0),
    totalReviews: integer("totalReviews").default(0),
    totalProjects: integer("totalProjects").default(0),
    profileViews: integer("profileViews").default(0),
    // Professional title (e.g. "Baş Memar")
    professionalTitle: varchar("professionalTitle", { length: 150 }),
    // Service areas (cities/regions a professional covers)
    serviceAreas: text("serviceAreas").array(),
    // Tools & software skills (free-text slugs: autocad, revit, etc.)
    skillsList: text("skillsList").array(),
    // Languages spoken
    languages: text("languages").array(),
    // Education & Certifications — JSON array of {institution, degree, year}
    education: jsonb("education").$type<
      { institution: string; degree: string; year?: number }[]
    >(),
    // Service Packages — JSON array of {name, price, deliverables[], duration}
    servicePackages: jsonb("servicePackages").$type<
      { name: string; price: number; deliverables: string[]; duration: string }[]
    >(),
    // Availability status
    availabilityStatus: availabilityStatusEnum("availabilityStatus").default("available"),
    // SEO
    metaTitle: varchar("metaTitle", { length: 255 }),
    metaDescription: text("metaDescription"),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    usernameIdx: index("profiles_username_idx").on(table.username),
    cityIdx: index("profiles_city_idx").on(table.city),
    specializationIdx: index("profiles_specialization_idx").on(table.specialization),
  })
);

// ─────────────────────────── SKILLS ──────────────────────────────────────────

export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 50 }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const profileSkills = pgTable(
  "profileSkills",
  {
    profileId: uuid("profileId")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    skillId: uuid("skillId")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    level: integer("level").default(3), // 1-5
  },
  (table) => ({
    pk: primaryKey({ columns: [table.profileId, table.skillId] }),
  })
);

// ─────────────────────────── PORTFOLIO PROJECTS ───────────────────────────────

export const portfolioProjects = pgTable(
  "portfolioProjects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profileId")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 300 }).notNull(),
    description: text("description"),
    category: projectCategoryEnum("category").notNull(),
    location: varchar("location", { length: 255 }),
    city: varchar("city", { length: 100 }),
    latitude: real("latitude"),
    longitude: real("longitude"),
    area: integer("area"), // m²
    year: integer("year"),
    client: varchar("client", { length: 255 }),
    coverImage: text("coverImage"),
    isFeatured: boolean("isFeatured").notNull().default(false),
    isPublished: boolean("isPublished").notNull().default(true),
    viewCount: integer("viewCount").default(0),
    likeCount: integer("likeCount").default(0),
    videoUrl: text("videoUrl"),
    beforeImage: text("beforeImage"),
    afterImage: text("afterImage"),
    // Style tags as text array
    tags: text("tags").array(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    profileIdx: index("portfolio_profile_idx").on(table.profileId),
    categoryIdx: index("portfolio_category_idx").on(table.category),
    featuredIdx: index("portfolio_featured_idx").on(table.isFeatured),
    slugIdx: index("portfolio_slug_idx").on(table.slug),
  })
);

export const projectImages = pgTable("projectImages", {
  id: uuid("id").primaryKey().defaultRandom(),
  portfolioProjectId: uuid("portfolioProjectId")
    .notNull()
    .references(() => portfolioProjects.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  altText: varchar("altText", { length: 255 }),
  caption: text("caption"),
  width: integer("width"),
  height: integer("height"),
  order: integer("order").notNull().default(0),
  isCover: boolean("isCover").notNull().default(false),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

// ─────────────────────────── CLIENT PROJECTS (MARKETPLACE) ───────────────────

export const clientProjects = pgTable(
  "clientProjects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("clientId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    category: projectCategoryEnum("category").notNull(),
    location: varchar("location", { length: 255 }),
    city: varchar("city", { length: 100 }),
    area: integer("area"), // m²
    budgetRange: budgetRangeEnum("budgetRange"),
    budgetMin: integer("budgetMin"),
    budgetMax: integer("budgetMax"),
    deadline: timestamp("deadline", { mode: "date" }),
    status: projectStatusEnum("status").notNull().default("open"),
    isUrgent: boolean("isUrgent").notNull().default(false),
    viewCount: integer("viewCount").default(0),
    proposalCount: integer("proposalCount").default(0),
    coverImage: text("coverImage"),
    referenceImages: text("referenceImages").array(),
    requirements: text("requirements"),
    assignedProfessionalId: uuid("assignedProfessionalId").references(
      () => profiles.id
    ),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    clientIdx: index("client_projects_client_idx").on(table.clientId),
    statusIdx: index("client_projects_status_idx").on(table.status),
    categoryIdx: index("client_projects_category_idx").on(table.category),
    cityIdx: index("client_projects_city_idx").on(table.city),
  })
);

// ─────────────────────────── PROPOSALS ───────────────────────────────────────

export const proposals = pgTable(
  "proposals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientProjectId: uuid("clientProjectId")
      .notNull()
      .references(() => clientProjects.id, { onDelete: "cascade" }),
    professionalId: uuid("professionalId")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    proposedPrice: integer("proposedPrice"), // in AZN
    estimatedDuration: varchar("estimatedDuration", { length: 100 }),
    status: proposalStatusEnum("status").notNull().default("pending"),
    isRead: boolean("isRead").notNull().default(false),
    attachments: text("attachments").array(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    projectIdx: index("proposals_project_idx").on(table.clientProjectId),
    professionalIdx: index("proposals_professional_idx").on(table.professionalId),
  })
);

// ─────────────────────────── CONVERSATIONS & MESSAGES ────────────────────────

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    participantOneId: uuid("participantOneId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    participantTwoId: uuid("participantTwoId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    relatedProjectId: uuid("relatedProjectId").references(
      () => clientProjects.id,
      { onDelete: "set null" }
    ),
    lastMessageAt: timestamp("lastMessageAt", { mode: "date" }).defaultNow(),
    lastMessagePreview: varchar("lastMessagePreview", { length: 255 }),
    isActive: boolean("isActive").notNull().default(true),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    p1Idx: index("conversations_p1_idx").on(table.participantOneId),
    p2Idx: index("conversations_p2_idx").on(table.participantTwoId),
  })
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversationId")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: uuid("senderId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    attachments: text("attachments").array(),
    attachmentUrl: text("attachmentUrl"),
    attachmentName: text("attachmentName"),
    isRead: boolean("isRead").notNull().default(false),
    readAt: timestamp("readAt", { mode: "date" }),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    conversationIdx: index("messages_conversation_idx").on(table.conversationId),
    senderIdx: index("messages_sender_idx").on(table.senderId),
  })
);

// ─────────────────────────── REVIEWS & RATINGS ───────────────────────────────

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reviewerId: uuid("reviewerId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    profileId: uuid("profileId")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    clientProjectId: uuid("clientProjectId").references(
      () => clientProjects.id,
      { onDelete: "set null" }
    ),
    rating: integer("rating").notNull(), // 1-5
    title: varchar("title", { length: 255 }),
    content: text("content"),
    isVerified: boolean("isVerified").notNull().default(false),
    isPublished: boolean("isPublished").notNull().default(true),
    ownerReply: text("ownerReply"),
    ownerReplyAt: timestamp("ownerReplyAt", { mode: "date" }),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    profileIdx: index("reviews_profile_idx").on(table.profileId),
    reviewerIdx: index("reviews_reviewer_idx").on(table.reviewerId),
  })
);

// ─────────────────────────── VERIFICATION ────────────────────────────────────

export const verificationBadges = pgTable("verificationBadges", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profileId")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  badge: verificationBadgeEnum("badge").notNull(),
  issuedAt: timestamp("issuedAt", { mode: "date" }).notNull().defaultNow(),
  expiresAt: timestamp("expiresAt", { mode: "date" }),
  isActive: boolean("isActive").notNull().default(true),
});

// ─────────────────────────── FAVORITES / BOOKMARKS ───────────────────────────

export const favorites = pgTable(
  "favorites",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    portfolioProjectId: uuid("portfolioProjectId")
      .notNull()
      .references(() => portfolioProjects.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.portfolioProjectId] }),
  })
);

// ─────────────────────────── NOTIFICATIONS ───────────────────────────────────

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message"),
    link: varchar("link", { length: 500 }),
    isRead: boolean("isRead").notNull().default(false),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("notifications_user_idx").on(table.userId),
  })
);

// ─────────────────────────── RELATIONS ───────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  accounts: many(accounts),
  sessions: many(sessions),
  clientProjects: many(clientProjects),
  sentMessages: many(messages),
  notifications: many(notifications),
  reviews: many(reviews),
  conversationsAsOne: many(conversations, { relationName: "participantOne" }),
  conversationsAsTwo: many(conversations, { relationName: "participantTwo" }),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  portfolioProjects: many(portfolioProjects),
  profileSkills: many(profileSkills),
  proposals: many(proposals),
  reviews: many(reviews),
  verificationBadges: many(verificationBadges),
}));

export const portfolioProjectsRelations = relations(
  portfolioProjects,
  ({ one, many }) => ({
    profile: one(profiles, {
      fields: [portfolioProjects.profileId],
      references: [profiles.id],
    }),
    images: many(projectImages),
    favorites: many(favorites),
  })
);

export const clientProjectsRelations = relations(
  clientProjects,
  ({ one, many }) => ({
    client: one(users, {
      fields: [clientProjects.clientId],
      references: [users.id],
    }),
    proposals: many(proposals),
    assignedProfessional: one(profiles, {
      fields: [clientProjects.assignedProfessionalId],
      references: [profiles.id],
    }),
    reviews: many(reviews),
  })
);

export const proposalsRelations = relations(proposals, ({ one }) => ({
  clientProject: one(clientProjects, {
    fields: [proposals.clientProjectId],
    references: [clientProjects.id],
  }),
  professional: one(profiles, {
    fields: [proposals.professionalId],
    references: [profiles.id],
  }),
}));

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    participantOne: one(users, {
      fields: [conversations.participantOneId],
      references: [users.id],
      relationName: "participantOne",
    }),
    participantTwo: one(users, {
      fields: [conversations.participantTwoId],
      references: [users.id],
      relationName: "participantTwo",
    }),
    messages: many(messages),
    relatedProject: one(clientProjects, {
      fields: [conversations.relatedProjectId],
      references: [clientProjects.id],
    }),
  })
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
  }),
  profile: one(profiles, {
    fields: [reviews.profileId],
    references: [profiles.id],
  }),
  clientProject: one(clientProjects, {
    fields: [reviews.clientProjectId],
    references: [clientProjects.id],
  }),
}));

export const verificationBadgesRelations = relations(verificationBadges, ({ one }) => ({
  profile: one(profiles, {
    fields: [verificationBadges.profileId],
    references: [profiles.id],
  }),
}));

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
  portfolioProject: one(portfolioProjects, {
    fields: [projectImages.portfolioProjectId],
    references: [portfolioProjects.id],
  }),
}));

export const profileSkillsRelations = relations(profileSkills, ({ one }) => ({
  profile: one(profiles, {
    fields: [profileSkills.profileId],
    references: [profiles.id],
  }),
  skill: one(skills, {
    fields: [profileSkills.skillId],
    references: [skills.id],
  }),
}));

// ─────────────────────────── CLIENT OFFERS ───────────────────────────────────

export const clientOffers = pgTable("clientOffers", {
  id: uuid("id").primaryKey().defaultRandom(),
  architectProfileId: uuid("architectProfileId")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  clientUserId: uuid("clientUserId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  budget: integer("budget"),
  duration: varchar("duration", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

// ─────────────────────────── PROFILE QUESTIONS ───────────────────────────────

export const profileQuestions = pgTable("profileQuestions", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profileId")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  askerUserId: uuid("askerUserId")
    .references(() => users.id, { onDelete: "set null" }),
  askerName: varchar("askerName", { length: 255 }),
  question: text("question").notNull(),
  answer: text("answer"),
  answeredAt: timestamp("answeredAt", { mode: "date" }),
  isPublished: boolean("isPublished").notNull().default(true),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

// ─────────────────────────── TYPES ───────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type PortfolioProject = typeof portfolioProjects.$inferSelect;
export type NewPortfolioProject = typeof portfolioProjects.$inferInsert;
export type ProjectImage = typeof projectImages.$inferSelect;
export type ClientProject = typeof clientProjects.$inferSelect;
export type NewClientProject = typeof clientProjects.$inferInsert;
export type Proposal = typeof proposals.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Skill = typeof skills.$inferSelect;
