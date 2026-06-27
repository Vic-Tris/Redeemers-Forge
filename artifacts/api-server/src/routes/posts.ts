import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import {
  postsTable,
  postLikesTable,
  postBookmarksTable,
} from "@workspace/db";
import { eq, desc, and, ilike, or, sql, inArray } from "drizzle-orm";
import {
  ListPostsQueryParams,
  CreatePostBody,
  UpdatePostBody,
} from "@workspace/api-zod";

const router = Router();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}

function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// GET /posts
router.get("/", async (req: Request, res: Response) => {
  const query = ListPostsQueryParams.safeParse(req.query);
  const params = query.success ? query.data : {};
  const { type, category, tag, featured, premium, limit = 20, offset = 0 } = params as {
    type?: string; category?: string; tag?: string;
    featured?: boolean; premium?: boolean; limit?: number; offset?: number;
  };

  const conditions: ReturnType<typeof eq>[] = [];
  if (type) conditions.push(eq(postsTable.type, type));
  if (category) conditions.push(eq(postsTable.category, category));
  if (featured !== undefined) conditions.push(eq(postsTable.isFeatured, featured));
  if (premium !== undefined) conditions.push(eq(postsTable.isPremium, premium));
  conditions.push(eq(postsTable.isPublished, true));

  const whereClause = conditions.length > 1
    ? and(...conditions)
    : conditions[0] ?? eq(postsTable.isPublished, true);

  const [posts, countResult] = await Promise.all([
    db.select().from(postsTable)
      .where(whereClause)
      .orderBy(desc(postsTable.publishedAt))
      .limit(Number(limit))
      .offset(Number(offset)),
    db.select({ count: sql<number>`count(*)` }).from(postsTable).where(whereClause),
  ]);

  const userId = req.headers["x-user-id"] as string | undefined;
  let likedIds: number[] = [];
  let bookmarkedIds: number[] = [];

  if (userId && posts.length > 0) {
    const postIds = posts.map((p) => p.id);
    const [likes, bookmarks] = await Promise.all([
      db.select().from(postLikesTable).where(and(eq(postLikesTable.userId, userId), inArray(postLikesTable.postId, postIds))),
      db.select().from(postBookmarksTable).where(and(eq(postBookmarksTable.userId, userId), inArray(postBookmarksTable.postId, postIds))),
    ]);
    likedIds = likes.map((l) => l.postId);
    bookmarkedIds = bookmarks.map((b) => b.postId);
  }

  res.json({
    posts: posts.map((p) => ({
      ...p,
      publishedAt: p.publishedAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
      isLiked: userId ? likedIds.includes(p.id) : null,
      isBookmarked: userId ? bookmarkedIds.includes(p.id) : null,
    })),
    total: Number(countResult[0]?.count ?? 0),
  });
});

// GET /posts/featured
router.get("/featured", async (_req: Request, res: Response) => {
  const posts = await db.select().from(postsTable)
    .where(and(eq(postsTable.isFeatured, true), eq(postsTable.isPublished, true)))
    .orderBy(desc(postsTable.publishedAt))
    .limit(5);

  res.json(posts.map((p) => ({
    ...p,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    isLiked: null,
    isBookmarked: null,
  })));
});

// GET /posts/trending
router.get("/trending", async (_req: Request, res: Response) => {
  const posts = await db.select().from(postsTable)
    .where(eq(postsTable.isPublished, true))
    .orderBy(desc(postsTable.likeCount), desc(postsTable.viewCount))
    .limit(6);

  res.json(posts.map((p) => ({
    ...p,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    isLiked: null,
    isBookmarked: null,
  })));
});

// GET /posts/:id
router.get("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, id));
  if (!post) { res.status(404).json({ error: "Post not found" }); return; }

  // Increment view count
  await db.update(postsTable).set({ viewCount: sql`${postsTable.viewCount} + 1` }).where(eq(postsTable.id, id));

  const userId = req.headers["x-user-id"] as string | undefined;
  let isLiked = null;
  let isBookmarked = null;

  if (userId) {
    const [like, bookmark] = await Promise.all([
      db.select().from(postLikesTable).where(and(eq(postLikesTable.userId, userId), eq(postLikesTable.postId, id))),
      db.select().from(postBookmarksTable).where(and(eq(postBookmarksTable.userId, userId), eq(postBookmarksTable.postId, id))),
    ]);
    isLiked = like.length > 0;
    isBookmarked = bookmark.length > 0;
  }

  res.json({
    ...post,
    viewCount: post.viewCount + 1,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
    isLiked,
    isBookmarked,
  });
});

// POST /posts
router.post("/", async (req: Request, res: Response) => {
  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const data = parsed.data;
  const slug = `${slugify(data.title)}-${Date.now()}`;
  const readingTimeMinutes = data.readingTimeMinutes ?? estimateReadingTime(data.content);

  const [post] = await db.insert(postsTable).values({
    ...data,
    slug,
    readingTimeMinutes,
    tags: data.tags ?? [],
    publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
  }).returning();

  res.status(201).json({
    ...post,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
    isLiked: null,
    isBookmarked: null,
  });
});

// PATCH /posts/:id
router.patch("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = UpdatePostBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const updateData: Partial<typeof postsTable.$inferInsert> = { ...parsed.data, updatedAt: new Date() };

  const [post] = await db.update(postsTable).set(updateData).where(eq(postsTable.id, id)).returning();
  if (!post) { res.status(404).json({ error: "Post not found" }); return; }

  res.json({
    ...post,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
    isLiked: null,
    isBookmarked: null,
  });
});

// DELETE /posts/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(postsTable).where(eq(postsTable.id, id));
  res.status(204).send();
});

// POST /posts/:postId/like
router.post("/:postId/like", async (req: Request, res: Response) => {
  const postId = parseInt(req.params.postId);
  const userId = (req.headers["x-user-id"] as string) ?? "anonymous";
  if (isNaN(postId)) { res.status(400).json({ error: "Invalid postId" }); return; }

  const [existing] = await db.select().from(postLikesTable)
    .where(and(eq(postLikesTable.postId, postId), eq(postLikesTable.userId, userId)));

  if (existing) {
    await db.delete(postLikesTable).where(eq(postLikesTable.id, existing.id));
    await db.update(postsTable).set({ likeCount: sql`${postsTable.likeCount} - 1` }).where(eq(postsTable.id, postId));
    const [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
    res.json({ liked: false, likeCount: post?.likeCount ?? 0 });
  } else {
    await db.insert(postLikesTable).values({ postId, userId });
    await db.update(postsTable).set({ likeCount: sql`${postsTable.likeCount} + 1` }).where(eq(postsTable.id, postId));
    const [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
    res.json({ liked: true, likeCount: post?.likeCount ?? 0 });
  }
});

// POST /posts/:postId/bookmark
router.post("/:postId/bookmark", async (req: Request, res: Response) => {
  const postId = parseInt(req.params.postId);
  const userId = (req.headers["x-user-id"] as string) ?? "anonymous";
  if (isNaN(postId)) { res.status(400).json({ error: "Invalid postId" }); return; }

  const [existing] = await db.select().from(postBookmarksTable)
    .where(and(eq(postBookmarksTable.postId, postId), eq(postBookmarksTable.userId, userId)));

  if (existing) {
    await db.delete(postBookmarksTable).where(eq(postBookmarksTable.id, existing.id));
    await db.update(postsTable).set({ bookmarkCount: sql`${postsTable.bookmarkCount} - 1` }).where(eq(postsTable.id, postId));
    res.json({ bookmarked: false });
  } else {
    await db.insert(postBookmarksTable).values({ postId, userId });
    await db.update(postsTable).set({ bookmarkCount: sql`${postsTable.bookmarkCount} + 1` }).where(eq(postsTable.id, postId));
    res.json({ bookmarked: true });
  }
});

export default router;
