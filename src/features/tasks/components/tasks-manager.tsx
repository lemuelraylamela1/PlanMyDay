"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Sparkles, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { ListChecks } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { taskSchema, type TaskInput } from "@/features/tasks/schemas";
import {
  saveTaskAction,
  toggleTaskAction,
  deleteTaskAction,
  applyTaskTemplatesAction,
} from "@/features/tasks/actions";

export interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: TaskInput["priority"];
  deadline: string | null;
  assignedPerson: string | null;
  completed: boolean;
}

const priorityVariant: Record<TaskRow["priority"], "destructive" | "warning" | "info" | "secondary"> = {
  URGENT: "destructive",
  HIGH: "warning",
  MEDIUM: "info",
  LOW: "secondary",
};

export function TasksManager({ tasks }: { tasks: TaskRow[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TaskRow | null>(null);
  const [pending, setPending] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskInput>({ resolver: zodResolver(taskSchema) });

  function openCreate() {
    setEditing(null);
    reset({ title: "", description: "", category: "", priority: "MEDIUM", deadline: "", assignedPerson: "" });
    setOpen(true);
  }
  function openEdit(t: TaskRow) {
    setEditing(t);
    reset({
      title: t.title,
      description: t.description ?? "",
      category: t.category ?? "",
      priority: t.priority,
      deadline: t.deadline ? t.deadline.slice(0, 10) : "",
      assignedPerson: t.assignedPerson ?? "",
    });
    setOpen(true);
  }

  async function onSubmit(values: TaskInput) {
    setPending(true);
    const res = await saveTaskAction(editing?.id ?? null, values);
    setPending(false);
    if (res.success) { toast.success(res.message ?? "Saved."); setOpen(false); router.refresh(); }
    else toast.error(res.error);
  }

  async function onToggle(t: TaskRow) {
    const res = await toggleTaskAction(t.id, !t.completed);
    if (res.success) router.refresh();
    else toast.error(res.error);
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this task?")) return;
    const res = await deleteTaskAction(id);
    if (res.success) { toast.success("Deleted."); router.refresh(); }
    else toast.error(res.error);
  }

  async function onApplyTemplates() {
    setPending(true);
    const res = await applyTaskTemplatesAction();
    setPending(false);
    if (res.success) { toast.success(res.message ?? "Added."); router.refresh(); }
    else toast.error(res.error);
  }

  const priority = watch("priority");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={onApplyTemplates} disabled={pending}>
          <Sparkles className="h-4 w-4" /> Use checklist template
        </Button>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add task</Button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No tasks yet"
          description="Build your wedding checklist, or start from our template."
          action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add task</Button>}
        />
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => (
            <Card key={t.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <Checkbox checked={t.completed} onCheckedChange={() => onToggle(t)} />
                <div className="flex-1">
                  <p className={t.completed ? "font-medium line-through opacity-60" : "font-medium"}>
                    {t.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant={priorityVariant[t.priority]}>{t.priority}</Badge>
                    {t.category && <span>{t.category}</span>}
                    {t.deadline && <span>Due {formatDate(t.deadline)}</span>}
                    {t.assignedPerson && <span>· {t.assignedPerson}</span>}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete(t.id)}>
                      <Trash2 className="h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit task" : "Add task"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={2} {...register("description")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" {...register("category")} />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => setValue("priority", v as TaskInput["priority"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" type="date" {...register("deadline")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedPerson">Assigned to</Label>
                <Input id="assignedPerson" {...register("assignedPerson")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
