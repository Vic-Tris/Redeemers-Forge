import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { usersTable, postLikesTable, postBookmarksTable, postsTable, subscriptionsTable } from "@workspace/db";
import { eq, desc, inArray } from "drizzle-orm";
import { UpdateMyProfileBody } from "@workspace/api-zod";
import { getAuth } from "@clerk/express";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

async function upsertUser(id: string, name: string, email: string, avatar?: string | null) {
  const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
  await db.insert(usersTable)
    .values({ id, name, email, avatar: avatar ?? null, role: isAdmin ? "admin" : "user" })
    .onConflictDoNothing();

  // Promote existing user to admin if their email is in the list
  if (isAdmin) {
    await db.update(usersTable)
      .set({ role: "admin" })
      .where(eq(usersTable.id, id));
  }
}

// GET /users/me
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  const auth = getAuth(req);
  const userId = auth.userId!;

  const clerkUser = auth.sessionClaims;
  const name = (clerkUser?.firstName as string | undefined) ?? (clerkUser?.name as string | undefined) ?? "User";
  const email = (clerkUser?.email as string | undefined) ?? "";
  const avatar = clerkUser?.imageUrl as string | null | undefined;

  await upsertUser(userId, name, email, avatar);

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, userId));

  res.json({
    ...user,
    joinedAt: user.joinedAt.toISOString(),
    isPremium: sub?.status === "active",
  });
});

// PATCH /users/me
router.patch("/me", requireAuth, async (req: Request, res: Response) => {
  const auth = getAuth(req);
  const userId = auth.userId!;

  const parsed = UpdateMyProfileBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const updateData: Partial<typeof usersTable.$inferInsert> = {};
  if (parsed.data.name != null) updateData.name = parsed.data.name;
  if (parsed.data.username != null) updateData.username = parsed.data.username;
  if (parsed.data.bio != null) updateData.bio = parsed.data.bio;
  if (parsed.data.avatar != null) updateData.avatar = parsed.data.avatar;
  if (parsed.data.darkMode != null) updateData.darkMode = parsed.data.darkMode;

  const [user] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, userId)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  res.json({ ...user, joinedAt: user.joinedAt.toISOString() });
});

// GET /users/me/dashboard
router.get("/me/dashboard", requireAuth, async (req: Request, res: Response) => {
  const auth = getAuth(req);
  const userId = auth.userId!;

  const [likes, bookmarks] = await Promise.all([
    db.select().from(postLikesTable).where(eq(postLikesTable.userId, userId)).orderBy(desc(postLikesTable.createdAt)).limit(10),
    db.select().from(postBookmarksTable).where(eq(postBookmarksTable.userId, userId)).orderBy(desc(postBookmarksTable.createdAt)).limit(10),
  ]);

  const likedPostIds = likes.map((l) => l.postId);
  const bookmarkedPostIds = bookmarks.map((b) => b.postId);

  const [likedPosts, bookmarkedPosts, recentPosts] = await Promise.all([
    likedPostIds.length > 0
      ? db.select().from(postsTable).where(inArray(postsTable.id, likedPostIds))
      : Promise.resolve([]),
    bookmarkedPostIds.length > 0
      ? db.select().from(postsTable).where(inArray(postsTable.id, bookmarkedPostIds))
      : Promise.resolve([]),
    db.select().from(postsTable).where(eq(postsTable.isPublished, true)).orderBy(desc(postsTable.publishedAt)).limit(5),
  ]);

  function serializePost(p: typeof postsTable.$inferSelect) {
    return {
      ...p,
      publishedAt: p.publishedAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
      isLiked: likedPostIds.includes(p.id),
      isBookmarked: bookmarkedPostIds.includes(p.id),
    };
  }

  res.json({
    recentActivity: recentPosts.map(serializePost),
    likedPosts: likedPosts.map(serializePost),
    bookmarkedPosts: bookmarkedPosts.map(serializePost),
    readingStats: {
      totalPostsRead: recentPosts.length,
      totalLikes: likedPostIds.length,
      totalBookmarks: bookmarkedPostIds.length,
      totalComments: 0,
    },
  });
});

// GET /users — excludes admin accounts from public listing
router.get("/", async (req: Request, res: Response) => {
  const limit = parseInt(String(req.query.limit ?? "20"));
  const offset = parseInt(String(req.query.offset ?? "0"));

  const users = await db.select().from(usersTable)
    .where(eq(usersTable.role, "user"))
    .limit(limit)
    .offset(offset);
  res.json(users.map((u) => ({ ...u, joinedAt: u.joinedAt.toISOString() })));
});

// GET /users/:id
router.get("/:id", async (req: Request, res: Response) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, String(req.params.id)));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ ...user, joinedAt: user.joinedAt.toISOString() });
});

export default router;
