import { useState } from "react";
import { type Task } from "@shared/schema";
import { PRIORITY_COLORS, PRIORITY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  Loader2,
  Zap,
  GripVertical,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";

interface TaskPanelProps {
  tasks: Task[];
  isLoading: boolean;
  onCreateTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onAutoSchedule: () => void;
  isScheduling: boolean;
}

const statusIcons = {
  todo: Circle,
  in_progress: Loader2,
  done: CheckCircle2,
};

export function TaskPanel({
  tasks,
  isLoading,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onAutoSchedule,
  isScheduling,
}: TaskPanelProps) {
  const [filter, setFilter] = useState<string>("all");

  const filteredTasks = tasks.filter((t) => {
    if (filter === "all") return t.status !== "done";
    return t.status === filter;
  });

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedTasks = [...filteredTasks].sort(
    (a, b) =>
      (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2) -
      (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2)
  );

  return (
    <div className="flex flex-col h-full" data-testid="task-panel">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-lg font-semibold">Tasks</h2>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={onAutoSchedule}
              disabled={isScheduling}
              data-testid="button-auto-schedule"
            >
              <Zap className="w-3.5 h-3.5 mr-1" />
              {isScheduling ? "Scheduling..." : "Auto-schedule"}
            </Button>
            <Button
              size="sm"
              onClick={onCreateTask}
              data-testid="button-create-task"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add
            </Button>
          </div>
        </div>

        <div className="flex gap-1">
          {["all", "todo", "in_progress", "done"].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={filter === status ? "default" : "ghost"}
              onClick={() => setFilter(status)}
              data-testid={`button-filter-${status}`}
            >
              {status === "all"
                ? "Active"
                : STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <Circle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No tasks yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Add a task to get started
            </p>
          </div>
        ) : (
          sortedTasks.map((task) => {
            const StatusIcon =
              statusIcons[task.status as keyof typeof statusIcons] || Circle;
            const priorityColor =
              PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS] ||
              PRIORITY_COLORS.medium;

            return (
              <Card
                key={task.id}
                className="p-3 cursor-pointer hover-elevate active-elevate-2 group"
                onClick={() => onEditTask(task)}
                data-testid={`card-task-${task.id}`}
              >
                <div className="flex items-start gap-2">
                  <button
                    className="mt-0.5 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextStatus =
                        task.status === "todo"
                          ? "in_progress"
                          : task.status === "in_progress"
                          ? "done"
                          : "todo";
                      onStatusChange(task.id, nextStatus);
                    }}
                    data-testid={`button-status-${task.id}`}
                  >
                    <StatusIcon
                      className={cn(
                        "w-4 h-4",
                        task.status === "done"
                          ? "text-green-500"
                          : task.status === "in_progress"
                          ? "text-primary animate-spin"
                          : "text-muted-foreground"
                      )}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          task.status === "done" &&
                            "line-through text-muted-foreground"
                        )}
                      >
                        {task.title}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0"
                        style={{
                          backgroundColor: priorityColor + "18",
                          color: priorityColor,
                        }}
                      >
                        {PRIORITY_LABELS[
                          task.priority as keyof typeof PRIORITY_LABELS
                        ] || "Medium"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {task.duration}m
                      </span>
                      {task.deadline && (
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(task.deadline), "MMM d")}
                        </span>
                      )}
                      {task.scheduledStart && (
                        <span className="flex items-center gap-1 text-[11px] text-primary">
                          <Zap className="w-3 h-3" />
                          Scheduled
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
                      onDeleteTask(task.id);
                    }}
                    data-testid={`button-delete-task-${task.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
