import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { categoriesTable } from "@workspace/db";
import { asc } from "drizzle-orm";
import { CreateCategoryBody } from "@workspace/api-zod";

const router = Router();

// GET /categories
router.get("/", async (_req: Request, res: Response) => {
  const cats = await db.select().from(categoriesTable).orderBy(asc(categoriesTable.name));
  res.json(cats.map((c) => ({ ...c, createdAt: undefined })));
});

// POST /categories
router.post("/", async (req: Request, res: Response) => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const [cat] = await db.insert(categoriesTable).values(parsed.data).returning();
  res.status(201).json({ ...cat, createdAt: undefined });
});

export default router;
