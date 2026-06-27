import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const videosTable = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url").notNull(),
  category: text("category"),
  viewCount: integer("view_count").notNull().default(0),
  likeCount: integer("like_count").notNull().default(0),
  duration: text("duration").notNull().default("0:00"),
  isPremium: boolean("is_premium").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVideoSchema = createInsertSchema(videosTable).omit({ id: true, createdAt: true });
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videosTable.$inferSelect;
