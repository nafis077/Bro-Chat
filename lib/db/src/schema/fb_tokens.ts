import { pgTable, serial, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tokenStatusEnum = pgEnum("token_status", ["active", "expired", "invalid"]);

export const fbTokensTable = pgTable("fb_tokens", {
  id: serial("id").primaryKey(),
  fbId: text("fb_id").notNull(),
  token: text("token").notNull(),
  status: tokenStatusEnum("status").notNull().default("active"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFbTokenSchema = createInsertSchema(fbTokensTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFbToken = z.infer<typeof insertFbTokenSchema>;
export type FbToken = typeof fbTokensTable.$inferSelect;
