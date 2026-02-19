import {
  type Task,
  type InsertTask,
  type Habit,
  type InsertHabit,
  type TimeBlock,
  type InsertTimeBlock,
  type Settings,
  type InsertSettings,
  tasks,
  habits,
  timeBlocks,
  settings,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<void>;

  getHabits(): Promise<Habit[]>;
  getHabit(id: string): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: string, habit: Partial<InsertHabit>): Promise<Habit | undefined>;
  deleteHabit(id: string): Promise<void>;

  getTimeBlocks(start: Date, end: Date): Promise<TimeBlock[]>;
  getTimeBlock(id: string): Promise<TimeBlock | undefined>;
  createTimeBlock(block: InsertTimeBlock): Promise<TimeBlock>;
  updateTimeBlock(id: string, block: Partial<InsertTimeBlock>): Promise<TimeBlock | undefined>;
  deleteTimeBlock(id: string): Promise<void>;
  deleteTimeBlocksByReference(referenceId: string): Promise<void>;
  deleteTimeBlocksByType(blockType: string): Promise<void>;

  getSettings(): Promise<Settings | undefined>;
  upsertSettings(s: InsertSettings): Promise<Settings>;
}

export class DatabaseStorage implements IStorage {
  async getTasks(): Promise<Task[]> {
    return db.select().from(tasks);
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [created] = await db.insert(tasks).values(task).returning();
    return created;
  }

  async updateTask(id: string, data: Partial<InsertTask>): Promise<Task | undefined> {
    const [updated] = await db
      .update(tasks)
      .set(data)
      .where(eq(tasks.id, id))
      .returning();
    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(timeBlocks).where(eq(timeBlocks.referenceId, id));
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getHabits(): Promise<Habit[]> {
    return db.select().from(habits);
  }

  async getHabit(id: string): Promise<Habit | undefined> {
    const [habit] = await db.select().from(habits).where(eq(habits.id, id));
    return habit;
  }

  async createHabit(habit: InsertHabit): Promise<Habit> {
    const [created] = await db.insert(habits).values(habit).returning();
    return created;
  }

  async updateHabit(id: string, data: Partial<InsertHabit>): Promise<Habit | undefined> {
    const [updated] = await db
      .update(habits)
      .set(data)
      .where(eq(habits.id, id))
      .returning();
    return updated;
  }

  async deleteHabit(id: string): Promise<void> {
    await db.delete(timeBlocks).where(eq(timeBlocks.referenceId, id));
    await db.delete(habits).where(eq(habits.id, id));
  }

  async getTimeBlocks(start: Date, end: Date): Promise<TimeBlock[]> {
    return db
      .select()
      .from(timeBlocks)
      .where(
        and(
          gte(timeBlocks.startTime, start),
          lte(timeBlocks.endTime, end)
        )
      );
  }

  async getTimeBlock(id: string): Promise<TimeBlock | undefined> {
    const [block] = await db
      .select()
      .from(timeBlocks)
      .where(eq(timeBlocks.id, id));
    return block;
  }

  async createTimeBlock(block: InsertTimeBlock): Promise<TimeBlock> {
    const [created] = await db.insert(timeBlocks).values(block).returning();
    return created;
  }

  async updateTimeBlock(id: string, data: Partial<InsertTimeBlock>): Promise<TimeBlock | undefined> {
    const [updated] = await db
      .update(timeBlocks)
      .set(data)
      .where(eq(timeBlocks.id, id))
      .returning();
    return updated;
  }

  async deleteTimeBlock(id: string): Promise<void> {
    await db.delete(timeBlocks).where(eq(timeBlocks.id, id));
  }

  async deleteTimeBlocksByReference(referenceId: string): Promise<void> {
    await db.delete(timeBlocks).where(eq(timeBlocks.referenceId, referenceId));
  }

  async deleteTimeBlocksByType(blockType: string): Promise<void> {
    await db.delete(timeBlocks).where(eq(timeBlocks.blockType, blockType));
  }

  async getSettings(): Promise<Settings | undefined> {
    const [s] = await db.select().from(settings);
    return s;
  }

  async upsertSettings(s: InsertSettings): Promise<Settings> {
    const existing = await this.getSettings();
    if (existing) {
      const [updated] = await db
        .update(settings)
        .set(s)
        .where(eq(settings.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(settings).values(s).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
