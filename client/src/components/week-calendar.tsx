import { useMemo, useRef } from "react";
import { type TimeBlock } from "@shared/schema";
import { HOURS } from "@/lib/constants";
import {
  getWeekDays,
  formatDayHeader,
  formatDayNumber,
  isToday,
  isSameDay,
  timeToPosition,
} from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WeekCalendarProps {
  currentDate: Date;
  timeBlocks: TimeBlock[];
  onBlockClick?: (block: TimeBlock) => void;
  onSlotClick?: (date: Date, hour: number) => void;
}

const HOUR_HEIGHT = 64;
const START_HOUR = 6;

export function WeekCalendar({
  currentDate,
  timeBlocks,
  onBlockClick,
  onSlotClick,
}: WeekCalendarProps) {
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const blocksByDay = useMemo(() => {
    const map = new Map<string, TimeBlock[]>();
    weekDays.forEach((day) => {
      const dayKey = day.toISOString().split("T")[0];
      map.set(dayKey, []);
    });

    timeBlocks.forEach((block) => {
      const start = new Date(block.startTime);
      const dayKey = start.toISOString().split("T")[0];
      const existing = map.get(dayKey);
      if (existing) {
        existing.push(block);
      }
    });

    return map;
  }, [timeBlocks, weekDays]);

  const currentTimePosition = useMemo(() => {
    const now = new Date();
    return timeToPosition(now, START_HOUR);
  }, []);

  return (
    <div className="flex flex-col h-full" data-testid="week-calendar">
      <div className="flex border-b sticky top-0 z-30 bg-background">
        <div className="w-16 shrink-0" />
        {weekDays.map((day, i) => {
          const today = isToday(day);
          return (
            <div
              key={i}
              className={cn(
                "flex-1 text-center py-3 border-l",
                today && "bg-primary/5"
              )}
            >
              <div
                className={cn(
                  "text-xs font-medium uppercase tracking-wider",
                  today ? "text-primary" : "text-muted-foreground"
                )}
              >
                {formatDayHeader(day)}
              </div>
              <div
                className={cn(
                  "text-lg font-semibold mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-full",
                  today && "bg-primary text-primary-foreground"
                )}
              >
                {formatDayNumber(day)}
              </div>
            </div>
          );
        })}
      </div>

      <ScrollArea className="flex-1">
        <div className="flex relative">
          <div className="w-16 shrink-0">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="relative"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="absolute -top-2.5 right-3 text-[11px] text-muted-foreground font-medium tabular-nums">
                  {hour === 0
                    ? "12 AM"
                    : hour < 12
                    ? `${hour} AM`
                    : hour === 12
                    ? "12 PM"
                    : `${hour - 12} PM`}
                </span>
              </div>
            ))}
          </div>

          {weekDays.map((day, dayIndex) => {
            const dayKey = day.toISOString().split("T")[0];
            const dayBlocks = blocksByDay.get(dayKey) || [];
            const today = isToday(day);

            return (
              <div
                key={dayIndex}
                className={cn("flex-1 relative border-l", today && "bg-primary/[0.03]")}
              >
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-dashed border-border/60 cursor-pointer"
                    style={{ height: HOUR_HEIGHT }}
                    onClick={() => onSlotClick?.(day, hour)}
                    data-testid={`slot-day-${dayIndex}-hour-${hour}`}
                  />
                ))}

                {today && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{
                      top: (currentTimePosition / 60) * HOUR_HEIGHT,
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-destructive -ml-[5px]" />
                      <div className="flex-1 h-[2px] bg-destructive" />
                    </div>
                  </div>
                )}

                {dayBlocks.map((block) => {
                  const start = new Date(block.startTime);
                  const end = new Date(block.endTime);
                  const topMinutes = timeToPosition(start, START_HOUR);
                  const durationMinutes =
                    (end.getTime() - start.getTime()) / (1000 * 60);
                  const top = (topMinutes / 60) * HOUR_HEIGHT;
                  const height = (durationMinutes / 60) * HOUR_HEIGHT;

                  return (
                    <div
                      key={block.id}
                      className="absolute left-1 right-1 rounded-md cursor-pointer overflow-hidden transition-shadow hover:shadow-md z-10"
                      style={{
                        top: Math.max(0, top),
                        height: Math.max(20, height),
                        backgroundColor: block.color + "22",
                        borderLeft: `3px solid ${block.color}`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBlockClick?.(block);
                      }}
                      data-testid={`block-${block.id}`}
                    >
                      <div className="p-1.5 overflow-hidden">
                        <div
                          className="text-xs font-semibold truncate"
                          style={{ color: block.color }}
                        >
                          {block.title}
                        </div>
                        {height > 30 && (
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {start.toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}{" "}
                            -{" "}
                            {end.toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
