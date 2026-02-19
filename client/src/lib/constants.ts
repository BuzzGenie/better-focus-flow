export const PRIORITY_COLORS = {
  critical: "#EF4444",
  high: "#F97316",
  medium: "#3B82F6",
  low: "#6B7280",
} as const;

export const PRIORITY_LABELS = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
} as const;

export const STATUS_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
} as const;

export const PREFERRED_TIME_LABELS = {
  morning: "Morning (6am - 12pm)",
  afternoon: "Afternoon (12pm - 5pm)",
  evening: "Evening (5pm - 9pm)",
} as const;

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export const BLOCK_COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#6366F1",
] as const;

export const HOURS = Array.from({ length: 16 }, (_, i) => i + 6);
