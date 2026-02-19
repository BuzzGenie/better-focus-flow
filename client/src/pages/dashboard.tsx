import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Task, type Habit, type TimeBlock } from "@shared/schema";
import { addWeeks, subWeeks, format } from "@/lib/date-utils";
import { formatMonthYear, getWeekRange } from "@/lib/date-utils";
import { WeekCalendar } from "@/components/week-calendar";
import { TaskPanel } from "@/components/task-panel";
import { HabitPanel } from "@/components/habit-panel";
import { TaskDialog } from "@/components/task-dialog";
import { HabitDialog } from "@/components/habit-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ListTodo,
  Repeat,
  LayoutGrid,
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [habitDialogOpen, setHabitDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [sideTab, setSideTab] = useState("tasks");

  const weekRange = getWeekRange(currentDate);

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: habits = [], isLoading: habitsLoading } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
  });

  const { data: timeBlocks = [], isLoading: blocksLoading } = useQuery<
    TimeBlock[]
  >({
    queryKey: [
      "/api/time-blocks",
      `?start=${weekRange.start.toISOString()}&end=${weekRange.end.toISOString()}`,
    ],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/tasks", {
        ...data,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/time-blocks"] });
      setTaskDialogOpen(false);
      toast({ title: "Task created" });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, {
        ...data,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/time-blocks"] });
      setTaskDialogOpen(false);
      setEditingTask(null);
      toast({ title: "Task updated" });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/time-blocks"] });
      toast({ title: "Task deleted" });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const autoScheduleMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auto-schedule");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/time-blocks"] });
      toast({ title: "Tasks auto-scheduled", description: "Your calendar has been updated" });
    },
    onError: (e: Error) => {
      toast({ title: "Error scheduling", description: e.message, variant: "destructive" });
    },
  });

  const createHabitMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/habits", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/time-blocks"] });
      setHabitDialogOpen(false);
      toast({ title: "Habit created" });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const updateHabitMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/habits/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/time-blocks"] });
      setHabitDialogOpen(false);
      setEditingHabit(null);
      toast({ title: "Habit updated" });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/habits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/time-blocks"] });
      toast({ title: "Habit deleted" });
    },
  });

  const toggleHabitMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const res = await apiRequest("PATCH", `/api/habits/${id}`, { active });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/time-blocks"] });
    },
  });

  const handleSlotClick = useCallback(
    (date: Date, hour: number) => {
      setEditingTask(null);
      setTaskDialogOpen(true);
    },
    []
  );

  const handleBlockClick = useCallback((block: TimeBlock) => {
    if (block.blockType === "task" && block.referenceId) {
      const task = tasks.find((t) => t.id === block.referenceId);
      if (task) {
        setEditingTask(task);
        setTaskDialogOpen(true);
      }
    }
  }, [tasks]);

  const handleTaskSubmit = (data: any) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, data });
    } else {
      createTaskMutation.mutate(data);
    }
  };

  const handleHabitSubmit = (data: any) => {
    if (editingHabit) {
      updateHabitMutation.mutate({ id: editingHabit.id, data });
    } else {
      createHabitMutation.mutate(data);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background" data-testid="dashboard">
      <header className="flex items-center justify-between gap-2 px-4 py-2.5 border-b bg-background sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-5 h-5 text-primary" />
            <h1 className="text-base font-semibold tracking-tight">BFF</h1>
          </div>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setCurrentDate((d) => subWeeks(d, 1))}
              data-testid="button-prev-week"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              data-testid="button-today"
            >
              Today
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setCurrentDate((d) => addWeeks(d, 1))}
              data-testid="button-next-week"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {formatMonthYear(currentDate)}
          </span>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <WeekCalendar
            currentDate={currentDate}
            timeBlocks={timeBlocks}
            onBlockClick={handleBlockClick}
            onSlotClick={handleSlotClick}
          />
        </div>

        <div className="w-80 border-l bg-background shrink-0 overflow-hidden flex flex-col">
          <Tabs
            value={sideTab}
            onValueChange={setSideTab}
            className="flex flex-col h-full"
          >
            <div className="border-b px-2">
              <TabsList className="w-full bg-transparent justify-start gap-0 h-auto p-0">
                <TabsTrigger
                  value="tasks"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2.5"
                  data-testid="tab-tasks"
                >
                  <ListTodo className="w-4 h-4 mr-1.5" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger
                  value="habits"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2.5"
                  data-testid="tab-habits"
                >
                  <Repeat className="w-4 h-4 mr-1.5" />
                  Habits
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="tasks" className="flex-1 overflow-hidden m-0">
              <TaskPanel
                tasks={tasks}
                isLoading={tasksLoading}
                onCreateTask={() => {
                  setEditingTask(null);
                  setTaskDialogOpen(true);
                }}
                onEditTask={(task) => {
                  setEditingTask(task);
                  setTaskDialogOpen(true);
                }}
                onDeleteTask={(id) => deleteTaskMutation.mutate(id)}
                onStatusChange={(id, status) =>
                  statusMutation.mutate({ id, status })
                }
                onAutoSchedule={() => autoScheduleMutation.mutate()}
                isScheduling={autoScheduleMutation.isPending}
              />
            </TabsContent>
            <TabsContent value="habits" className="flex-1 overflow-hidden m-0">
              <HabitPanel
                habits={habits}
                isLoading={habitsLoading}
                onCreateHabit={() => {
                  setEditingHabit(null);
                  setHabitDialogOpen(true);
                }}
                onEditHabit={(habit) => {
                  setEditingHabit(habit);
                  setHabitDialogOpen(true);
                }}
                onDeleteHabit={(id) => deleteHabitMutation.mutate(id)}
                onToggleHabit={(id, active) =>
                  toggleHabitMutation.mutate({ id, active })
                }
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <TaskDialog
        open={taskDialogOpen}
        onClose={() => {
          setTaskDialogOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        task={editingTask}
        isPending={
          createTaskMutation.isPending || updateTaskMutation.isPending
        }
      />

      <HabitDialog
        open={habitDialogOpen}
        onClose={() => {
          setHabitDialogOpen(false);
          setEditingHabit(null);
        }}
        onSubmit={handleHabitSubmit}
        habit={editingHabit}
        isPending={
          createHabitMutation.isPending || updateHabitMutation.isPending
        }
      />
    </div>
  );
}
