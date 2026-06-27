import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { usersTable, postLikesTable, postBookmarksTable, postsTable, subscriptionsTable } from "@workspace/db";
import { eq, desc, and, inArray } from "drizzle-orm";
import { UpdateMyProfileBody } from "@workspace/api-zod";

const router = Router();

async function upsertUser(id: string, name: string, email: string, avatar?: string) {
  const existing = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (existing.length === 0) {
    await db.insert(usersTable).values({ id, name, email, avatar: avatar ?? null }).onConflictDoNothing();
  }
}

// GET /users/me
router.get("/me", async (req: Request, res: Response) => {
  const userId = req.headers["x-user-id"] as string | undefined;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const name = (req.headers["x-user-name"] as string) ?? "User";
  const email = (req.headers["x-user-email"] as string) ?? "";
  const avatar = req.headers["x-user-avatar"] as string | undefined;

  await upsertUser(userId, name, email, avatar);

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  res.json({
    ...user,
    joinedAt: user.joinedAt.toISOString(),
  });
});

// PATCH /users/me
router.patch("/me", async (req: Request, res: Response) => {
  const userId = req.headers["x-user-id"] as string | undefined;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

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
router.get("/me/dashboard", async (req: Request, res: Response) => {
  const userId = req.headers["x-user-id"] as string | undefined;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

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

// GET /users
router.get("/", async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  const users = await db.select().from(usersTable).limit(limit).offset(offset);
  res.json(users.map((u) => ({ ...u, joinedAt: u.joinedAt.toISOString() })));
});

// GET /users/:id
router.get("/:id", async (req: Request, res: Response) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.params.id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ ...user, joinedAt: user.joinedAt.toISOString() });
});

export default router;
