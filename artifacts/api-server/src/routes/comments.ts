import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { commentsTable, postsTable } from "@workspace/db";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { SubmitCommentBody, UpdateCommentBody } from "@workspace/api-zod";

const router = Router({ mergeParams: true });

// GET /posts/:postId/comments
router.get("/posts/:postId/comments", async (req: Request, res: Response) => {
  const postId = parseInt(req.params.postId);
  if (isNaN(postId)) { res.status(400).json({ error: "Invalid postId" }); return; }

  const topLevel = await db.select().from(commentsTable)
    .where(and(eq(commentsTable.postId, postId), isNull(commentsTable.parentId)))
    .orderBy(desc(commentsTable.isPinned), desc(commentsTable.createdAt));

  const replies = await db.select().from(commentsTable)
    .where(and(eq(commentsTable.postId, postId)))
    .orderBy(desc(commentsTable.createdAt));

  const replyMap = new Map<number, typeof replies>();
  for (const r of replies) {
    if (r.parentId) {
      if (!replyMap.has(r.parentId)) replyMap.set(r.parentId, []);
      replyMap.get(r.parentId)!.push(r);
    }
  }

  const result = topLevel.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    replies: (replyMap.get(c.id) ?? []).map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      replies: [],
    })),
  }));

  res.json(result);
});

// POST /posts/:postId/comments
router.post("/posts/:postId/comments", async (req: Request, res: Response) => {
  const postId = parseInt(req.params.postId);
  if (isNaN(postId)) { res.status(400).json({ error: "Invalid postId" }); return; }

  const parsed = SubmitCommentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const userId = req.headers["x-user-id"] as string | undefined;
  const authorName = (req.headers["x-user-name"] as string) ?? "Anonymous";
  const authorAvatar = req.headers["x-user-avatar"] as string | undefined;

  const [comment] = await db.insert(commentsTable).values({
    postId,
    parentId: parsed.data.parentId ?? null,
    authorId: userId ?? null,
    authorName,
    authorAvatar: authorAvatar ?? null,
    content: parsed.data.content,
  }).returning();

  // Increment comment count on post
  await db.update(postsTable)
    .set({ commentCount: sql`${postsTable.commentCount} + 1` })
    .where(eq(postsTable.id, postId));

  res.status(201).json({ ...comment, createdAt: comment.createdAt.toISOString(), replies: [] });
});

// PATCH /comments/:id
router.patch("/comments/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = UpdateCommentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const [comment] = await db.update(commentsTable)
    .set({ content: parsed.data.content, updatedAt: new Date() })
    .where(eq(commentsTable.id, id))
    .returning();

  if (!comment) { res.status(404).json({ error: "Comment not found" }); return; }
  res.json({ ...comment, createdAt: comment.createdAt.toISOString(), replies: [] });
});

// DELETE /comments/:id
router.delete("/comments/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(commentsTable).where(eq(commentsTable.id, id));
  res.status(204).send();
});

export default router;
