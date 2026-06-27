import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { videosTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { ListVideosQueryParams, CreateVideoBody } from "@workspace/api-zod";

const router = Router();

// GET /videos
router.get("/", async (req: Request, res: Response) => {
  const query = ListVideosQueryParams.safeParse(req.query);
  const params = query.success ? query.data : {};
  const { category, featured, limit = 20, offset = 0 } = params as {
    category?: string; featured?: boolean; limit?: number; offset?: number;
  };

  const conditions = [];
  if (category) conditions.push(eq(videosTable.category, category));
  if (featured !== undefined) conditions.push(eq(videosTable.isFeatured, featured));

  const videos = await db.select().from(videosTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(videosTable.createdAt))
    .limit(Number(limit))
    .offset(Number(offset));

  res.json(videos.map((v) => ({ ...v, createdAt: v.createdAt.toISOString() })));
});

// POST /videos
router.post("/", async (req: Request, res: Response) => {
  const parsed = CreateVideoBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const { duration, ...rest } = parsed.data;

  const [video] = await db.insert(videosTable).values({
    ...rest,
    duration: duration ?? undefined,
  }).returning();
  res.status(201).json({ ...video, createdAt: video.createdAt.toISOString() });
});

// GET /videos/:id
router.get("/:id", async (req: Request, res: Response) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [video] = await db.select().from(videosTable).where(eq(videosTable.id, id));
  if (!video) { res.status(404).json({ error: "Video not found" }); return; }

  res.json({ ...video, createdAt: video.createdAt.toISOString() });
});

export default router;
