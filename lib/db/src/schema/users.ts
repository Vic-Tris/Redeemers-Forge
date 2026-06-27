import { pgTable, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  name: text("name").notNull(),
  username: text("username").unique(),
  email: text("email").notNull().unique(),
  bio: text("bio"),
  avatar: text("avatar"),
  role: text("role").notNull().default("user"), // user, admin
  isPremium: boolean("is_premium").notNull().default(false),
  darkMode: boolean("dark_mode").notNull().default(false),
  postCount: integer("post_count").notNull().default(0),
  likeCount: integer("like_count").notNull().default(0),
  bookmarkCount: integer("bookmark_count").notNull().default(0),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ joinedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
