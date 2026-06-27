import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { postsTable, videosTable, booksTable } from "@workspace/db";
import { ilike, or, eq, and } from "drizzle-orm";

const router = Router();

// GET /search?q=...&type=post|video|book&limit=20
router.get("/", async (req: Request, res: Response) => {
  const q = req.query.q as string;
  const type = req.query.type as string | undefined;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

  if (!q || q.trim().length === 0) {
    res.json({ posts: [], videos: [], books: [], total: 0 });
    return;
  }

  const term = `%${q.trim()}%`;

  const [posts, videos, books] = await Promise.all([
    (!type || type === "post")
      ? db.select().from(postsTable)
          .where(and(
            or(ilike(postsTable.title, term), ilike(postsTable.excerpt, term)),
            eq(postsTable.isPublished, true),
          ))
          .limit(limit)
      : Promise.resolve([]),
    (!type || type === "video")
      ? db.select().from(videosTable)
          .where(or(ilike(videosTable.title, term), ilike(videosTable.description, term)))
          .limit(limit)
      : Promise.resolve([]),
    (!type || type === "book")
      ? db.select().from(booksTable)
          .where(or(ilike(booksTable.title, term), ilike(booksTable.description, term)))
          .limit(limit)
      : Promise.resolve([]),
  ]);

  res.json({
    posts: posts.map((p) => ({
      ...p,
      publishedAt: p.publishedAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
      isLiked: null,
      isBookmarked: null,
    })),
    videos: videos.map((v) => ({ ...v, createdAt: v.createdAt.toISOString() })),
    books: books.map((b) => ({ ...b, price: b.price ? parseFloat(b.price) : null, createdAt: b.createdAt.toISOString() })),
    total: posts.length + videos.length + books.length,
  });
});

export default router;
