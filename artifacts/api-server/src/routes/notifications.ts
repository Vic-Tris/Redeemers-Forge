import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { getAuth } from "@clerk/express";

const router = Router();

// GET /notifications
router.get("/", async (req: Request, res: Response) => {
  const userId = getAuth(req)?.userId;
  if (!userId) { res.json([]); return; }

  const unreadOnly = req.query.unreadOnly === "true";
  const conditions = [eq(notificationsTable.userId, userId)];
  if (unreadOnly) conditions.push(eq(notificationsTable.isRead, false));

  const notifications = await db.select().from(notificationsTable)
    .where(and(...conditions))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);

  res.json(notifications.map((n) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
  })));
});

// POST /notifications/read-all
router.post("/read-all", async (req: Request, res: Response) => {
  const userId = getAuth(req)?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  await db.update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.userId, userId));

  res.json({ success: true });
});

export default router;
