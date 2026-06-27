import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // new_post, reply, like, premium, announcement
  message: text("message").notNull(),
  postId: integer("post_id"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
