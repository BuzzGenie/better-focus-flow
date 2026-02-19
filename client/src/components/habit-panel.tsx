import { type Habit } from "@shared/schema";
import { DAY_LABELS, PREFERRED_TIME_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Clock,
  Sun,
  Sunset,
  Moon,
  Loader2,
  Repeat,
  Trash2,
} from "lucide-react";

interface HabitPanelProps {
  habits: Habit[];
  isLoading: boolean;
  onCreateHabit: () => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
  onToggleHabit: (id: string, active: boolean) => void;
}

const timeIcons = {
  morning: Sun,
  afternoon: Sunset,
  evening: Moon,
};

export function HabitPanel({
  habits,
  isLoading,
  onCreateHabit,
  onEditHabit,
  onDeleteHabit,
  onToggleHabit,
}: HabitPanelProps) {
  return (
    <div className="flex flex-col h-full" data-testid="habit-panel">
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Habits</h2>
          <Button
            size="sm"
            onClick={onCreateHabit}
            data-testid="button-create-habit"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : habits.length === 0 ? (
          <div className="text-center py-12">
            <Repeat className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No habits yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Create recurring time blocks
            </p>
          </div>
        ) : (
          habits.map((habit) => {
            const TimeIcon =
              timeIcons[habit.preferredTime as keyof typeof timeIcons] || Sun;

            return (
              <Card
                key={habit.id}
                className={cn(
                  "p-3 cursor-pointer hover-elevate active-elevate-2 group",
                  !habit.active && "opacity-50"
                )}
                onClick={() => onEditHabit(habit)}
                data-testid={`card-habit-${habit.id}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-3 h-3 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: habit.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{habit.title}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {habit.duration}m
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <TimeIcon className="w-3 h-3" />
                        {habit.preferredTime}
                      </span>
                    </div>
                    <div className="flex gap-0.5 mt-2">
                      {DAY_LABELS.map((day, i) => (
                        <span
                          key={day}
                          className={cn(
                            "text-[9px] w-5 h-5 flex items-center justify-center rounded-full font-medium",
                            habit.daysOfWeek?.includes(i)
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground/40"
                          )}
                        >
                          {day[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ visibility: "hidden" }}
                      ref={(el) => {
                        if (el) {
                          const parent = el.closest(".group");
                          if (parent) {
                            parent.addEventListener("mouseenter", () => {
                              el.style.visibility = "visible";
                            });
                            parent.addEventListener("mouseleave", () => {
                              el.style.visibility = "hidden";
                            });
                          }
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHabit(habit.id);
                      }}
                      data-testid={`button-delete-habit-${habit.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <Switch
                      checked={habit.active}
                      onCheckedChange={(checked) => {
                        onToggleHabit(habit.id, checked);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      data-testid={`switch-habit-${habit.id}`}
                    />
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
