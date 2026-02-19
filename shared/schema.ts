import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("medium"),
  duration: integer("duration").notNull().default(30),
  deadline: timestamp("deadline"),
  scheduledStart: timestamp("scheduled_start"),
  scheduledEnd: timestamp("scheduled_end"),
  status: text("status").notNull().default("todo"),
  color: text("color").notNull().default("#3B82F6"),
});

export const habits = pgTable("habits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  duration: integer("duration").notNull().default(30),
  preferredTime: text("preferred_time").notNull().default("morning"),
  daysOfWeek: integer("days_of_week").array().notNull().default(sql`'{1,2,3,4,5}'`),
  color: text("color").notNull().default("#8B5CF6"),
  active: boolean("active").notNull().default(true),
  startTime: text("start_time"),
});

export const timeBlocks = pgTable("time_blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  blockType: text("block_type").notNull().default("task"),
  referenceId: varchar("reference_id"),
  color: text("color").notNull().default("#3B82F6"),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workStart: text("work_start").notNull().default("09:00"),
  workEnd: text("work_end").notNull().default("17:00"),
  workDays: integer("work_days").array().notNull().default(sql`'{1,2,3,4,5}'`),
  minBlockMinutes: integer("min_block_minutes").notNull().default(15),
  gcalEmail: text("gcal_email"),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });
export const insertHabitSchema = createInsertSchema(habits).omit({ id: true });
export const insertTimeBlockSchema = createInsertSchema(timeBlocks).omit({ id: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;
export type InsertTimeBlock = z.infer<typeof insertTimeBlockSchema>;
export type TimeBlock = typeof timeBlocks.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

export type User = { id: string; username: string; password: string };
export type InsertUser = { username: string; password: string };
