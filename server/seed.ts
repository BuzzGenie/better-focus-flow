import { storage } from "./storage";
import { addDays, setHours, setMinutes, startOfWeek } from "date-fns";

export async function seedDatabase() {
  const existingTasks = await storage.getTasks();
  if (existingTasks.length > 0) return;

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });

  await storage.createTask({
    title: "Write project proposal",
    description: "Draft the Q1 project proposal for the product redesign",
    priority: "high",
    duration: 90,
    deadline: addDays(today, 3),
    status: "todo",
    color: "#3B82F6",
  });

  await storage.createTask({
    title: "Review pull requests",
    description: "Review open PRs and provide feedback",
    priority: "medium",
    duration: 45,
    deadline: addDays(today, 1),
    status: "todo",
    color: "#6366F1",
  });

  await storage.createTask({
    title: "Update documentation",
    description: "Update API docs with the new endpoints",
    priority: "low",
    duration: 60,
    status: "todo",
    color: "#06B6D4",
  });

  await storage.createTask({
    title: "Fix login bug",
    description: "Users reporting intermittent login failures",
    priority: "critical",
    duration: 30,
    deadline: addDays(today, 0),
    status: "in_progress",
    color: "#EF4444",
  });

  await storage.createTask({
    title: "Design new dashboard",
    description: "Create mockups for the analytics dashboard",
    priority: "medium",
    duration: 120,
    deadline: addDays(today, 5),
    status: "todo",
    color: "#EC4899",
  });

  await storage.createHabit({
    title: "Lunch Break",
    duration: 60,
    preferredTime: "afternoon",
    daysOfWeek: [1, 2, 3, 4, 5],
    color: "#10B981",
    active: true,
    startTime: "12:00",
  });

  await storage.createHabit({
    title: "Morning Exercise",
    duration: 45,
    preferredTime: "morning",
    daysOfWeek: [1, 3, 5],
    color: "#F59E0B",
    active: true,
    startTime: "07:00",
  });

  await storage.createHabit({
    title: "Deep Focus Time",
    duration: 120,
    preferredTime: "morning",
    daysOfWeek: [1, 2, 3, 4, 5],
    color: "#8B5CF6",
    active: true,
    startTime: "09:00",
  });

  await storage.createHabit({
    title: "Email & Slack Catch-up",
    duration: 30,
    preferredTime: "afternoon",
    daysOfWeek: [1, 2, 3, 4, 5],
    color: "#06B6D4",
    active: true,
    startTime: "14:00",
  });

  // Create habit time blocks for this week
  const allHabits = await storage.getHabits();
  for (const habit of allHabits) {
    if (!habit.active) continue;
    const days = habit.daysOfWeek || [];
    for (const dayOfWeek of days) {
      const day = addDays(weekStart, dayOfWeek);
      let startH = 9;
      let startM = 0;

      if (habit.startTime) {
        const [h, m] = habit.startTime.split(":").map(Number);
        startH = h;
        startM = m;
      } else if (habit.preferredTime === "morning") {
        startH = 8;
      } else if (habit.preferredTime === "afternoon") {
        startH = 13;
      } else {
        startH = 18;
      }

      const blockStart = setMinutes(setHours(day, startH), startM);
      const blockEnd = new Date(
        blockStart.getTime() + habit.duration * 60 * 1000
      );

      await storage.createTimeBlock({
        title: habit.title,
        startTime: blockStart,
        endTime: blockEnd,
        blockType: "habit",
        referenceId: habit.id,
        color: habit.color,
      });
    }
  }

  await storage.upsertSettings({
    workStart: "09:00",
    workEnd: "17:00",
    workDays: [1, 2, 3, 4, 5],
    minBlockMinutes: 15,
  });

  console.log("Database seeded successfully");
}
