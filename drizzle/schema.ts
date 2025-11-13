import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Image generations table
 * Stores AI-generated images with their prompts and metadata
 */
export const generations = mysqlTable("generations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().default(0), // 0 for guest users
  prompt: text("prompt").notNull(),
  imageUrl: text("imageUrl").notNull(),
  imageKey: text("imageKey").notNull(), // S3 key for the image
  model: varchar("model", { length: 100 }),
  width: int("width"),
  height: int("height"),
  seed: int("seed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Generation = typeof generations.$inferSelect;
export type InsertGeneration = typeof generations.$inferInsert;
