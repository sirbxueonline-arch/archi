import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

// Auth is handled client-side via Supabase; userId is passed from client headers
const authMiddleware = async ({ req }: { req: Request }) => {
  const userId = req.headers.get("x-user-id");
  if (!userId) throw new Error("Unauthorized");
  return { userId };
};

export const ourFileRouter = {
  profileImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  coverImage: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  portfolioImages: f({ image: { maxFileSize: "16MB", maxFileCount: 20 } })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  referenceImages: f({ image: { maxFileSize: "8MB", maxFileCount: 10 } })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
