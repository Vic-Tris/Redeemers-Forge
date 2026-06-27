import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { postBookmarksTable, postsTable } from "@workspace/db";
import { eq, inArray, desc } from "drizzle-orm";

const router = Router();

// GET /bookmarks
router.get("/", async (req: Request, res: Response) => {
  const userId = req.headers["x-user-id"] as string | undefined;
  if (!userId) { res.json([]); return; }

  const bookmarks = await db.select().from(postBookmarksTable)
    .where(eq(postBookmarksTable.userId, userId))
    .orderBy(desc(postBookmarksTable.createdAt))
    .limit(50);

  if (bookmarks.length === 0) { res.json([]); return; }

  const postIds = bookmarks.map((b) => b.postId);
  const posts = await db.select().from(postsTable).where(inArray(postsTable.id, postIds));

  res.json(posts.map((p) => ({
    ...p,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    isLiked: null,
    isBookmarked: true,
  })));
});

export default router;
