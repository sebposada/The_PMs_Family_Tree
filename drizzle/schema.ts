import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, unique, primaryKey } from "drizzle-orm/mysql-core";

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
 * Extended user profiles with approval workflow
 */
export const profiles = mysqlTable("profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  displayName: varchar("displayName", { length: 255 }),
  approved: boolean("approved").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

/**
 * People in the family tree
 */
export const people = mysqlTable("people", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 255 }).notNull(),
  lastName: varchar("lastName", { length: 255 }).notNull(),
  birthDate: timestamp("birthDate"),
  deathDate: timestamp("deathDate"),
  birthPlace: text("birthPlace"),
  deathPlace: text("deathPlace"),
  bioMarkdown: text("bioMarkdown"),
  primaryMediaId: int("primaryMediaId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Person = typeof people.$inferSelect;
export type InsertPerson = typeof people.$inferInsert;

/**
 * Partnerships between people (supports multiple partners per person)
 */
export const partnerships = mysqlTable("partnerships", {
  id: int("id").autoincrement().primaryKey(),
  partner1Id: int("partner1Id").notNull().references(() => people.id, { onDelete: "cascade" }),
  partner2Id: int("partner2Id").notNull().references(() => people.id, { onDelete: "cascade" }),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Partnership = typeof partnerships.$inferSelect;
export type InsertPartnership = typeof partnerships.$inferInsert;

/**
 * Children linked to specific partnerships
 */
export const partnershipChildren = mysqlTable("partnership_children", {
  partnershipId: int("partnershipId").notNull().references(() => partnerships.id, { onDelete: "cascade" }),
  childId: int("childId").notNull().references(() => people.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.partnershipId, table.childId] }),
}));

export type PartnershipChild = typeof partnershipChildren.$inferSelect;
export type InsertPartnershipChild = typeof partnershipChildren.$inferInsert;

/**
 * Media files (images only for v1)
 */
export const media = mysqlTable("media", {
  id: int("id").autoincrement().primaryKey(),
  uploaderUserId: int("uploaderUserId").notNull().references(() => users.id, { onDelete: "cascade" }),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  url: text("url").notNull(),
  category: mysqlEnum("category", ["photo", "document"]).notNull(),
  caption: text("caption"),
  takenDate: timestamp("takenDate"),
  location: text("location"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Media = typeof media.$inferSelect;
export type InsertMedia = typeof media.$inferInsert;

/**
 * Tag people in media (who's in this photo)
 */
export const mediaPeople = mysqlTable("media_people", {
  mediaId: int("mediaId").notNull().references(() => media.id, { onDelete: "cascade" }),
  personId: int("personId").notNull().references(() => people.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.mediaId, table.personId] }),
}));

export type MediaPerson = typeof mediaPeople.$inferSelect;
export type InsertMediaPerson = typeof mediaPeople.$inferInsert;

/**
 * Comments on person pages
 */
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  personId: int("personId").notNull().references(() => people.id, { onDelete: "cascade" }),
  authorUserId: int("authorUserId").notNull().references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  isDeleted: boolean("isDeleted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;
