import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const businessSettings = pgTable("business_settings", {
  id: integer("id").primaryKey(),
  data: jsonb("data").notNull(),
});

export const jobs = pgTable("jobs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  vehicle: text("vehicle").notNull().default(""),
  symptom: text("symptom").notNull().default(""),
  diagnosis: text("diagnosis").notNull().default(""),
  application: text("application").notNull().default(""),
  result: text("result").notNull().default(""),
  cover: text("cover").notNull().default(""),
  gallery: jsonb("gallery").$type<string[]>().notNull().default([]),
  alt: text("alt").notNull().default(""),
  status: text("status").notNull().default("draft"),
  featured: boolean("featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  isExample: boolean("is_example").notNull().default(false),
});

export const redirects = pgTable("redirects", {
  oldSlug: text("old_slug").primaryKey(),
  newSlug: text("new_slug").notNull(),
});
