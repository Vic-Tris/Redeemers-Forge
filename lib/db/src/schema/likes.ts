import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const postLikesTable = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const postBookmarksTable = pgTable("post_bookmarks", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
