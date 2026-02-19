import { storage } from "./storage";
import { addDays, startOfDay, setHours, setMinutes } from "date-fns";

interface TimeSlot {
  start: Date;
  end: Date;
}

export async function autoScheduleTasks() {
  const allTasks = await storage.getTasks();
  const unscheduledTasks = allTasks
    .filter((t) => t.status !== "done" && !t.scheduledStart)
    .sort((a, b) => {
      const priorityOrder: Record<string, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
      };
      const pA = priorityOrder[a.priority] ?? 2;
      const pB = priorityOrder[b.priority] ?? 2;
      if (pA !== pB) return pA - pB;
      if (a.deadline && b.deadline)
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return 0;
    });

  if (unscheduledTasks.length === 0) return;

  let settingsData = await storage.getSettings();
  if (!settingsData) {
    settingsData = await storage.upsertSettings({
      workStart: "09:00",
      workEnd: "17:00",
      workDays: [1, 2, 3, 4, 5],
      minBlockMinutes: 15,
    });
  }

  const [workStartH, workStartM] = settingsData.workStart.split(":").map(Number);
  const [workEndH, workEndM] = settingsData.workEnd.split(":").map(Number);
  const workDays = settingsData.workDays || [1, 2, 3, 4, 5];

  const today = startOfDay(new Date());
  const scheduleEnd = addDays(today, 14);

  const existingBlocks = await storage.getTimeBlocks(today, scheduleEnd);
  const busySlots: TimeSlot[] = existingBlocks.map((b) => ({
    start: new Date(b.startTime),
    end: new Date(b.endTime),
  }));

  for (const task of unscheduledTasks) {
    const durationMs = task.duration * 60 * 1000;
    let slot = findAvailableSlot(
      today,
      scheduleEnd,
      durationMs,
      busySlots,
      workDays,
      workStartH,
      workStartM,
      workEndH,
      workEndM
    );

    if (slot) {
      await storage.updateTask(task.id, {
        scheduledStart: slot.start,
        scheduledEnd: slot.end,
      });

      await storage.createTimeBlock({
        title: task.title,
        startTime: slot.start,
        endTime: slot.end,
        blockType: "task",
        referenceId: task.id,
        color: task.color,
      });

      busySlots.push(slot);
    }
  }
}

function findAvailableSlot(
  rangeStart: Date,
  rangeEnd: Date,
  durationMs: number,
  busySlots: TimeSlot[],
  workDays: number[],
  workStartH: number,
  workStartM: number,
  workEndH: number,
  workEndM: number
): TimeSlot | null {
  let current = new Date(Math.max(rangeStart.getTime(), Date.now()));

  while (current < rangeEnd) {
    const day = current.getDay();
    if (!workDays.includes(day)) {
      current = addDays(startOfDay(current), 1);
      continue;
    }

    let dayStart = setMinutes(setHours(startOfDay(current), workStartH), workStartM);
    const dayEnd = setMinutes(setHours(startOfDay(current), workEndH), workEndM);

    if (current > dayStart) {
      dayStart = new Date(current);
      const mins = dayStart.getMinutes();
      const nextQuarter = Math.ceil(mins / 15) * 15;
      dayStart.setMinutes(nextQuarter, 0, 0);
    }

    let slotStart = new Date(dayStart);

    while (slotStart.getTime() + durationMs <= dayEnd.getTime()) {
      const slotEnd = new Date(slotStart.getTime() + durationMs);

      const hasConflict = busySlots.some(
        (busy) => slotStart < busy.end && slotEnd > busy.start
      );

      if (!hasConflict) {
        return { start: slotStart, end: slotEnd };
      }

      slotStart = new Date(slotStart.getTime() + 15 * 60 * 1000);
    }

    current = addDays(startOfDay(current), 1);
  }

  return null;
}
