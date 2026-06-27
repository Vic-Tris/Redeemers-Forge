import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const subscriptionsTable = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  plan: text("plan"), // monthly, yearly
  status: text("status").notNull().default("inactive"), // active, inactive, cancelled
  renewsAt: timestamp("renews_at"),
  cancelledAt: timestamp("cancelled_at"),
  isPremium: boolean("is_premium").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
