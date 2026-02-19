import {
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameDay,
  isToday,
  addWeeks,
  subWeeks,
  setHours,
  setMinutes,
  getHours,
  getMinutes,
} from "date-fns";

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function getWeekRange(date: Date) {
  return {
    start: startOfWeek(date, { weekStartsOn: 0 }),
    end: endOfWeek(date, { weekStartsOn: 0 }),
  };
}

export function formatTime(date: Date): string {
  return format(date, "h:mm a");
}

export function formatDayHeader(date: Date): string {
  return format(date, "EEE");
}

export function formatDayNumber(date: Date): string {
  return format(date, "d");
}

export function formatMonthYear(date: Date): string {
  return format(date, "MMMM yyyy");
}

export function timeToPosition(date: Date, startHour: number = 6): number {
  const hours = getHours(date);
  const minutes = getMinutes(date);
  return ((hours - startHour) * 60 + minutes);
}

export function positionToTime(position: number, day: Date, startHour: number = 6): Date {
  const totalMinutes = position + startHour * 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes / 15) * 15 % 60;
  let result = setHours(day, hours);
  result = setMinutes(result, minutes);
  return result;
}

export { addWeeks, subWeeks, isSameDay, isToday, format, addDays };
