"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, UserMinus, Users, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { tableSchema, type TableInput } from "@/features/seating/schemas";
import {
  saveTableAction,
  deleteTableAction,
  assignGuestAction,
  unassignGuestAction,
} from "@/features/seating/actions";

export interface SeatGuest {
  id: string;
  name: string;
}
export interface SeatingTableData {
  id: string;
  name: string;
  capacity: number;
  guests: SeatGuest[];
}

interface Props {
  tables: SeatingTableData[];
  unassigned: SeatGuest[];
}

export function SeatingBoard({ tables, unassigned }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SeatingTableData | null>(null);
  const [pending, setPending] = React.useState(false);
  const [dragGuest, setDragGuest] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TableInput>({ resolver: zodResolver(tableSchema) });

  function openCreate() {
    setEditing(null);
    reset({ name: "", capacity: 8, shape: "round" });
    setOpen(true);
  }
  function openEdit(t: SeatingTableData) {
    setEditing(t);
    reset({ name: t.name, capacity: t.capacity, shape: "round" });
    setOpen(true);
  }

  async function onSubmit(values: TableInput) {
    setPending(true);
    const res = await saveTableAction(editing?.id ?? null, values);
    setPending(false);
    if (res.success) { toast.success(res.message ?? "Saved."); setOpen(false); router.refresh(); }
    else toast.error(res.error);
  }

  async function assign(guestId: string, tableId: string) {
    const res = await assignGuestAction(guestId, tableId);
    if (res.success) router.refresh();
    else toast.error(res.error);
  }
  async function unassign(guestId: string) {
    const res = await unassignGuestAction(guestId);
    if (res.success) router.refresh();
    else toast.error(res.error);
  }
  async function removeTable(id: string) {
    if (!confirm("Delete this table? Guests will be unassigned.")) return;
    const res = await deleteTableAction(id);
    if (res.success) { toast.success("Deleted."); router.refresh(); }
    else toast.error(res.error);
  }

  const shape = watch("shape");

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Card
        className="h-fit"
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => dragGuest && unassign(dragGuest)}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" /> Unassigned ({unassigned.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {unassigned.length === 0 ? (
            <p className="text-sm text-muted-foreground">Everyone is seated.</p>
          ) : (
            unassigned.map((g) => (
              <div
                key={g.id}
                draggable
                onDragStart={() => setDragGuest(g.id)}
                onDragEnd={() => setDragGuest(null)}
                className="cursor-grab rounded-md border bg-card px-3 py-2 text-sm active:cursor-grabbing"
              >
                {g.name}
              </div>
            ))
          )}
          <p className="pt-2 text-xs text-muted-foreground">
            Drag guests onto a table. Drop here to unassign.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add table</Button>
        </div>
        {tables.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No tables yet. Add your first table to start seating guests.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {tables.map((t) => {
              const over = t.guests.length > t.capacity;
              return (
                <Card
                  key={t.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => dragGuest && assign(dragGuest, t.id)}
                  className={over ? "border-destructive" : ""}
                >
                  <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base">{t.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Badge variant={over ? "destructive" : t.guests.length === t.capacity ? "success" : "secondary"}>
                        {t.guests.length}/{t.capacity}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => removeTable(t.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="min-h-[80px] space-y-1">
                    {t.guests.length === 0 ? (
                      <p className="py-4 text-center text-xs text-muted-foreground">
                        Drop guests here
                      </p>
                    ) : (
                      t.guests.map((g) => (
                        <div
                          key={g.id}
                          draggable
                          onDragStart={() => setDragGuest(g.id)}
                          onDragEnd={() => setDragGuest(null)}
                          className="group flex items-center justify-between rounded-md border px-2 py-1 text-sm"
                        >
                          <span className="cursor-grab truncate active:cursor-grabbing">{g.name}</span>
                          <button
                            onClick={() => unassign(g.id)}
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                            aria-label="Unassign"
                          >
                            <UserMinus className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit table" : "Add table"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Table name</Label>
              <Input id="name" placeholder="e.g. Table 1" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" type="number" min={1} max={50} {...register("capacity")} />
              </div>
              <div className="space-y-2">
                <Label>Shape</Label>
                <Select value={shape} onValueChange={(v) => setValue("shape", v as TableInput["shape"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="round">Round</SelectItem>
                    <SelectItem value="rectangle">Rectangle</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                  </SelectContent>
                </Select>
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
