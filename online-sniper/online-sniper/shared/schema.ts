import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  isRunning: boolean("is_running").default(false),
  checkIntervalSeconds: integer("check_interval_seconds").default(180),
  words: text("words").array().default([]), // List of specific usernames to target
  rotationalProxyUrl: text("rotational_proxy_url").default(""),
});

export const botTokens = pgTable("bot_tokens", {
  id: serial("id").primaryKey(),
  token: text("token").notNull(),
  channelId: text("channel_id").notNull(),
});

export const userTokens = pgTable("user_tokens", {
  id: serial("id").primaryKey(),
  token: text("token").notNull(),
  label: text("label").default(""), // For identification
});

export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  totalChecked: integer("total_checked").default(0),
  availableFound: integer("available_found").default(0),
  rateLimitedCount: integer("rate_limited_count").default(0),
});

export const foundUsernames = pgTable("found_usernames", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  snipedOnAccount: boolean("sniped_on_account").default(false),
});

export const proxies = pgTable("proxies", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(), 
  isWorking: boolean("is_working").default(true),
  lastUsedAt: timestamp("last_used_at"),
});

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  level: text("level").notNull().default("info"), // info, error, success
  timestamp: timestamp("timestamp").defaultNow(),
});

// Schemas
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });
export const insertBotTokenSchema = createInsertSchema(botTokens).omit({ id: true });
export const insertUserTokenSchema = createInsertSchema(userTokens).omit({ id: true });
export const insertStatsSchema = createInsertSchema(stats).omit({ id: true });
export const insertFoundUsernameSchema = createInsertSchema(foundUsernames).omit({ id: true, createdAt: true });
export const insertProxySchema = createInsertSchema(proxies).omit({ id: true, isWorking: true, lastUsedAt: true });
export const insertLogSchema = createInsertSchema(logs).omit({ id: true, timestamp: true });

// Types
export type Settings = typeof settings.$inferSelect;
export type BotToken = typeof botTokens.$inferSelect;
export type UserToken = typeof userTokens.$inferSelect;
export type Stats = typeof stats.$inferSelect;
export type FoundUsername = typeof foundUsernames.$inferSelect;
export type Proxy = typeof proxies.$inferSelect;
export type Log = typeof logs.$inferSelect;

export type UpdateSettingsRequest = Partial<z.infer<typeof insertSettingsSchema>>;
