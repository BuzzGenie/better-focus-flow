import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertHabitSchema } from "@shared/schema";
import { autoScheduleTasks } from "./scheduler";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Tasks
  app.get("/api/tasks", async (_req, res) => {
    const tasks = await storage.getTasks();
    res.json(tasks);
  });

  app.post("/api/tasks", async (req, res) => {
    const body = { ...req.body };
    if (body.deadline && typeof body.deadline === "string") {
      body.deadline = new Date(body.deadline);
    }
    if (body.scheduledStart && typeof body.scheduledStart === "string") {
      body.scheduledStart = new Date(body.scheduledStart);
    }
    if (body.scheduledEnd && typeof body.scheduledEnd === "string") {
      body.scheduledEnd = new Date(body.scheduledEnd);
    }
    const parsed = insertTaskSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.message });
    }
    const task = await storage.createTask(parsed.data);
    res.json(task);
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    const existing = await storage.getTask(req.params.id);
    if (!existing) return res.status(404).json({ message: "Task not found" });

    const body = { ...req.body };
    if (body.deadline && typeof body.deadline === "string") {
      body.deadline = new Date(body.deadline);
    }
    if (body.scheduledStart && typeof body.scheduledStart === "string") {
      body.scheduledStart = new Date(body.scheduledStart);
    }
    if (body.scheduledEnd && typeof body.scheduledEnd === "string") {
      body.scheduledEnd = new Date(body.scheduledEnd);
    }

    const task = await storage.updateTask(req.params.id, body);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.body.status === "done" || req.body.scheduledStart === null) {
      await storage.deleteTimeBlocksByReference(req.params.id);
      if (req.body.status === "done") {
        await storage.updateTask(req.params.id, { scheduledStart: null, scheduledEnd: null });
      }
    }

    res.json(task);
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    await storage.deleteTask(req.params.id);
    res.json({ success: true });
  });

  // Habits
  app.get("/api/habits", async (_req, res) => {
    const habits = await storage.getHabits();
    res.json(habits);
  });

  app.post("/api/habits", async (req, res) => {
    const parsed = insertHabitSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.message });
    }
    const habit = await storage.createHabit(parsed.data);
    res.json(habit);
  });

  app.patch("/api/habits/:id", async (req, res) => {
    const habit = await storage.updateHabit(req.params.id, req.body);
    if (!habit) return res.status(404).json({ message: "Habit not found" });
    res.json(habit);
  });

  app.delete("/api/habits/:id", async (req, res) => {
    await storage.deleteHabit(req.params.id);
    res.json({ success: true });
  });

  // Time Blocks
  app.get("/api/time-blocks", async (req, res) => {
    const start = req.query.start
      ? new Date(req.query.start as string)
      : new Date();
    const end = req.query.end
      ? new Date(req.query.end as string)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const blocks = await storage.getTimeBlocks(start, end);
    res.json(blocks);
  });

  app.post("/api/time-blocks", async (req, res) => {
    const block = await storage.createTimeBlock(req.body);
    res.json(block);
  });

  app.delete("/api/time-blocks/:id", async (req, res) => {
    await storage.deleteTimeBlock(req.params.id);
    res.json({ success: true });
  });

  // Auto-schedule
  app.post("/api/auto-schedule", async (_req, res) => {
    try {
      await autoScheduleTasks();
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Settings
  app.get("/api/settings", async (_req, res) => {
    let s = await storage.getSettings();
    if (!s) {
      s = await storage.upsertSettings({
        workStart: "09:00",
        workEnd: "17:00",
        workDays: [1, 2, 3, 4, 5],
        minBlockMinutes: 15,
      });
    }
    res.json(s);
  });

  app.patch("/api/settings", async (req, res) => {
    const s = await storage.upsertSettings(req.body);
    res.json(s);
  });

  return httpServer;
}
