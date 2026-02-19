import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Task, type Habit, type TimeBlock, type Settings } from "@shared/schema";
import { getWeekRange } from "@/lib/date-utils";
import { TaskPanel } from "@/components/task-panel";
import { HabitPanel } from "@/components/habit-panel";
import { TaskDialog } from "@/components/task-dialog";
import { HabitDialog } from "@/components/habit-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays,
  ListTodo,
  Repeat,
  Calendar,
  PanelLeftClose,
  PanelLeftOpen,
  Check,
  X,
} from "lucide-react";

function buildGcalUrl(email: string) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(email)}&ctz=${tz}&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=0&showTz=0&mode=WEEK`;
}

export default function Dashboard() {
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const [currentDate] = useState(new Date());
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [habitDialogOpen, setHabitDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [sideTab, setSideTab] = useState("tasks");
  const [showGcal, setShowGcal] = useState(true);
  const [gcalInput, setGcalInput] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const weekRange = getWeekRange(currentDate);

  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  const gcalEmail = settings?.gcalEmail || "";

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<Settings>) => {
      const res = await apiRequest("PATCH", "/api/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setIsEditingEmail(false);
      toast({ title: "Settings saved" });
    },
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: habits = [], isLoading: habitsLoading } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
  });

  const { data: timeBlocks = [] } = useQuery<TimeBlock[]>({
    queryKey: [
      "/api/time-blocks",
      `?start=${weekRange.start.toISOString()}&end=${weekRange.end.toISOString()}`,
    ],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/tasks", {
        ...data,
        deadline: data.deadline ? data.deadline + "T23:59:59" : null,
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
        deadline: data.deadline ? data.deadline + "T23:59:59" : null,
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

  const handleSaveGcalEmail = () => {
    updateSettingsMutation.mutate({ gcalEmail: gcalInput.trim() || null } as any);
  };

  return (
    <div className="flex flex-col h-screen bg-background" data-testid="dashboard">
      <header className="flex items-center justify-between gap-2 px-4 py-2 border-b bg-card/50 sticky top-0 z-40">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary/15 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-sm font-semibold tracking-tight uppercase text-foreground/80" data-testid="text-branding">Better Focus Flow</h1>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowGcal((v) => !v)}
            data-testid="button-toggle-gcal"
          >
            {showGcal ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {showGcal && (
          <div className="flex-1 min-w-0 border-r flex flex-col bg-card/30" data-testid="gcal-panel">
            <div className="flex items-center justify-between gap-2 px-3 py-2 border-b flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Google Calendar</span>
              </div>
              {gcalEmail && !isEditingEmail && (
                <button
                  onClick={() => { setGcalInput(gcalEmail); setIsEditingEmail(true); }}
                  className="text-[10px] text-muted-foreground/70 truncate max-w-[140px]"
                  data-testid="button-edit-gcal-email"
                >
                  {gcalEmail}
                </button>
              )}
            </div>
            {!gcalEmail || isEditingEmail ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center space-y-3 max-w-xs">
                  <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm text-muted-foreground">Enter your Google Calendar email to see it here</p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="email"
                      placeholder="you@gmail.com"
                      value={gcalInput}
                      onChange={(e) => setGcalInput(e.target.value)}
                      className="text-sm"
                      data-testid="input-gcal-email"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleSaveGcalEmail}
                      disabled={!gcalInput.trim()}
                      data-testid="button-save-gcal-email"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    {isEditingEmail && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setIsEditingEmail(false)}
                        data-testid="button-cancel-gcal-email"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <iframe
                src={buildGcalUrl(gcalEmail)}
                className="flex-1 w-full border-0"
                style={{
                  minHeight: 0,
                  ...(resolvedTheme === "dark" ? {
                    filter: "invert(0.88) hue-rotate(180deg)",
                  } : {}),
                }}
                title="Google Calendar"
                data-testid="gcal-iframe"
              />
            )}
          </div>
        )}

        <div className="w-80 shrink-0 overflow-hidden flex flex-col border-l-0">
          <Tabs
            value={sideTab}
            onValueChange={setSideTab}
            className="flex flex-col h-full"
          >
            <div className="border-b px-1">
              <TabsList className="w-full bg-transparent justify-start gap-0 h-auto p-0">
                <TabsTrigger
                  value="tasks"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3 py-2"
                  data-testid="tab-tasks"
                >
                  <ListTodo className="w-3.5 h-3.5 mr-1.5" />
                  <span className="text-xs">Tasks</span>
                </TabsTrigger>
                <TabsTrigger
                  value="habits"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3 py-2"
                  data-testid="tab-habits"
                >
                  <Repeat className="w-3.5 h-3.5 mr-1.5" />
                  <span className="text-xs">Habits</span>
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
