import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type Task } from "@shared/schema";
import { BLOCK_COLORS, PRIORITY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.string().default("medium"),
  duration: z.coerce.number().min(5).max(480),
  deadline: z.string().optional(),
  color: z.string().default("#3B82F6"),
  status: z.string().default("todo"),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormValues) => void;
  task?: Task | null;
  isPending: boolean;
}

export function TaskDialog({
  open,
  onClose,
  onSubmit,
  task,
  isPending,
}: TaskDialogProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      priority: task?.priority || "medium",
      duration: task?.duration || 30,
      deadline: task?.deadline
        ? format(new Date(task.deadline), "yyyy-MM-dd")
        : "",
      color: task?.color || "#3B82F6",
      status: task?.status || "todo",
    },
  });

  const handleSubmit = (data: TaskFormValues) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What needs to be done?"
                      data-testid="input-task-title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional details..."
                      className="resize-none"
                      data-testid="input-task-description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-task-priority">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={5}
                        max={480}
                        data-testid="input-task-duration"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      data-testid="input-task-deadline"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <div className="flex gap-2 flex-wrap">
                    {BLOCK_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          "w-7 h-7 rounded-full transition-transform",
                          field.value === color &&
                            "ring-2 ring-offset-2 ring-primary"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => field.onChange(color)}
                        data-testid={`button-color-${color}`}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="button-cancel-task"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                data-testid="button-save-task"
              >
                {isPending ? "Saving..." : task ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
