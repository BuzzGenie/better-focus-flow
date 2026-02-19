import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type Habit } from "@shared/schema";
import { BLOCK_COLORS, DAY_LABELS } from "@/lib/constants";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const habitFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  duration: z.coerce.number().min(5).max(480),
  preferredTime: z.string().default("morning"),
  daysOfWeek: z.array(z.number()).min(1, "Select at least one day"),
  color: z.string().default("#8B5CF6"),
  startTime: z.string().optional(),
});

type HabitFormValues = z.infer<typeof habitFormSchema>;

interface HabitDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: HabitFormValues) => void;
  habit?: Habit | null;
  isPending: boolean;
}

export function HabitDialog({
  open,
  onClose,
  onSubmit,
  habit,
  isPending,
}: HabitDialogProps) {
  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      title: habit?.title || "",
      duration: habit?.duration || 30,
      preferredTime: habit?.preferredTime || "morning",
      daysOfWeek: habit?.daysOfWeek || [1, 2, 3, 4, 5],
      color: habit?.color || "#8B5CF6",
      startTime: habit?.startTime || "",
    },
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{habit ? "Edit Habit" : "New Habit"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
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
                      placeholder="e.g. Lunch, Exercise, Deep Work"
                      data-testid="input-habit-title"
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
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={5}
                        max={480}
                        data-testid="input-habit-duration"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Time</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-habit-time">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="afternoon">Afternoon</SelectItem>
                        <SelectItem value="evening">Evening</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specific Start Time (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      data-testid="input-habit-start-time"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="daysOfWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Days</FormLabel>
                  <div className="flex gap-1.5">
                    {DAY_LABELS.map((day, i) => {
                      const isSelected = field.value?.includes(i);
                      return (
                        <button
                          key={day}
                          type="button"
                          className={cn(
                            "w-9 h-9 rounded-full text-xs font-medium transition-colors",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                          onClick={() => {
                            const newValue = isSelected
                              ? field.value.filter((d: number) => d !== i)
                              : [...(field.value || []), i];
                            field.onChange(newValue);
                          }}
                          data-testid={`button-day-${day}`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
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
                        data-testid={`button-habit-color-${color}`}
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
                data-testid="button-cancel-habit"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                data-testid="button-save-habit"
              >
                {isPending ? "Saving..." : habit ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
