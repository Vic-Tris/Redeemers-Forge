import { pgTable, serial, text, integer, boolean, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const booksTable = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  description: text("description").notNull(),
  coverUrl: text("cover_url"),
  downloadUrl: text("download_url"),
  category: text("category"),
  isPremium: boolean("is_premium").notNull().default(false),
  price: numeric("price", { precision: 10, scale: 2 }),
  pages: integer("pages"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBookSchema = createInsertSchema(booksTable).omit({ id: true, createdAt: true });
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof booksTable.$inferSelect;
