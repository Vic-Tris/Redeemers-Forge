import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { booksTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { ListBooksQueryParams, CreateBookBody } from "@workspace/api-zod";

const router = Router();

// GET /books
router.get("/", async (req: Request, res: Response) => {
  const query = ListBooksQueryParams.safeParse(req.query);
  const params = query.success ? query.data : {};
  const { category, premium, limit = 20 } = params as {
    category?: string; premium?: boolean; limit?: number;
  };

  const conditions = [];
  if (category) conditions.push(eq(booksTable.category, category));
  if (premium !== undefined) conditions.push(eq(booksTable.isPremium, premium));

  const books = await db.select().from(booksTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(booksTable.createdAt))
    .limit(Number(limit));

  res.json(books.map((b) => ({
    ...b,
    price: b.price ? parseFloat(b.price) : null,
    createdAt: b.createdAt.toISOString(),
  })));
});

// POST /books
router.post("/", async (req: Request, res: Response) => {
  const parsed = CreateBookBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const [book] = await db.insert(booksTable).values({
    ...parsed.data,
    price: parsed.data.price ? String(parsed.data.price) : null,
  }).returning();
  res.status(201).json({ ...book, price: book.price ? parseFloat(book.price) : null, createdAt: book.createdAt.toISOString() });
});

// GET /books/:id
router.get("/:id", async (req: Request, res: Response) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [book] = await db.select().from(booksTable).where(eq(booksTable.id, id));
  if (!book) { res.status(404).json({ error: "Book not found" }); return; }

  res.json({ ...book, price: book.price ? parseFloat(book.price) : null, createdAt: book.createdAt.toISOString() });
});

export default router;
