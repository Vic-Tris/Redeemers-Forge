import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { postsTable, usersTable, commentsTable } from "@workspace/db";
import { eq, desc, sum, sql } from "drizzle-orm";

const router = Router();

// GET /analytics/global
router.get("/global", async (_req: Request, res: Response) => {
  const [
    postCount,
    userCount,
    commentCount,
    premiumUserCount,
    viewsSum,
    topPosts,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(postsTable).where(eq(postsTable.isPublished, true)),
    db.select({ count: sql<number>`count(*)` }).from(usersTable),
    db.select({ count: sql<number>`count(*)` }).from(commentsTable),
    db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.isPremium, true)),
    db.select({ total: sql<number>`sum(view_count)` }).from(postsTable),
    db.select().from(postsTable).where(eq(postsTable.isPublished, true)).orderBy(desc(postsTable.viewCount)).limit(5),
  ]);

  res.json({
    totalUsers: Number(userCount[0]?.count ?? 0),
    totalPosts: Number(postCount[0]?.count ?? 0),
    totalViews: Number(viewsSum[0]?.total ?? 0),
    totalComments: Number(commentCount[0]?.count ?? 0),
    totalPremiumUsers: Number(premiumUserCount[0]?.count ?? 0),
    revenueTotal: 0,
    topPosts: topPosts.map((p) => ({
      ...p,
      publishedAt: p.publishedAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
      isLiked: null,
      isBookmarked: null,
    })),
    recentSignups: 0,
  });
});

// GET /analytics/posts/:id
router.get("/posts/:id", async (req: Request, res: Response) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, id));
  if (!post) { res.status(404).json({ error: "Post not found" }); return; }

  res.json({
    postId: id,
    views: post.viewCount,
    likes: post.likeCount,
    comments: post.commentCount,
    bookmarks: post.bookmarkCount,
    shares: 0,
  });
});

export default router;
