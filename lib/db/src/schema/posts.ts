import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const postsTable = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull().default("story"), // story, devotional, article, sermon, announcement, testimonial, reflection
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  authorId: text("author_id"),
  authorName: text("author_name").notNull().default("The Redeemer's Forge"),
  authorAvatar: text("author_avatar"),
  coverImage: text("cover_image"),
  category: text("category"),
  tags: text("tags").array().notNull().default([]),
  isPremium: boolean("is_premium").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(true),
  readingTimeMinutes: integer("reading_time_minutes").notNull().default(5),
  viewCount: integer("view_count").notNull().default(0),
  likeCount: integer("like_count").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  bookmarkCount: integer("bookmark_count").notNull().default(0),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPostSchema = createInsertSchema(postsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof postsTable.$inferSelect;
