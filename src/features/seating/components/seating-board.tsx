"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Plus, Trash2, Loader2, UserMinus, Users, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";
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

type BoardState = {
  tables: SeatingTableData[];
  unassigned: SeatGuest[];
};

const UNASSIGNED_DROP_ID = "unassigned";

function tableDropId(tableId: string) {
  return `table-${tableId}`;
}

function findGuest(state: BoardState, guestId: string): SeatGuest | undefined {
  const fromPool = state.unassigned.find((g) => g.id === guestId);
  if (fromPool) return fromPool;
  for (const table of state.tables) {
    const guest = table.guests.find((g) => g.id === guestId);
    if (guest) return guest;
  }
  return undefined;
}

function moveGuest(state: BoardState, guestId: string, toTableId: string | null): BoardState | null {
  const guest = findGuest(state, guestId);
  if (!guest) return null;

  const tables = state.tables.map((table) => ({
    ...table,
    guests: table.guests.filter((g) => g.id !== guestId),
  }));
  let unassigned = state.unassigned.filter((g) => g.id !== guestId);

  if (toTableId === null) {
    unassigned = [...unassigned, guest];
    return { tables, unassigned };
  }

  const target = tables.find((t) => t.id === toTableId);
  if (!target) return null;
  if (target.guests.length >= target.capacity) return null;

  return {
    tables: tables.map((table) =>
      table.id === toTableId ? { ...table, guests: [...table.guests, guest] } : table,
    ),
    unassigned,
  };
}

function GuestChip({
  guest,
  isOverlay,
  isDragging,
}: {
  guest: SeatGuest;
  isOverlay?: boolean;
  isDragging?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border bg-card px-3 py-2 text-sm",
        isOverlay && "cursor-grabbing shadow-lg ring-2 ring-primary/40",
        !isOverlay && "cursor-grab active:cursor-grabbing",
        isDragging && !isOverlay && "opacity-40",
      )}
    >
      {guest.name}
    </div>
  );
}

function DraggableGuest({
  guest,
  onUnassign,
  className,
}: {
  guest: SeatGuest;
  onUnassign?: () => void;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: guest.id,
    data: { guest },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group flex items-center justify-between rounded-md border bg-card px-2 py-1 text-sm touch-none",
        isDragging && "opacity-40",
        className,
      )}
      {...listeners}
      {...attributes}
    >
      <span className="cursor-grab truncate active:cursor-grabbing">{guest.name}</span>
      {onUnassign && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUnassign();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="ml-1 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          aria-label="Unassign"
        >
          <UserMinus className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}

function DroppablePanel({
  id,
  children,
  className,
  isOver,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  isOver?: boolean;
}) {
  const { setNodeRef, isOver: over } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        className,
        (isOver ?? over) && "ring-2 ring-primary/50 ring-offset-2 ring-offset-background",
      )}
    >
      {children}
    </div>
  );
}

export function SeatingBoard({ tables, unassigned }: Props) {
  const [localTables, setLocalTables] = React.useState(tables);
  const [localUnassigned, setLocalUnassigned] = React.useState(unassigned);
  const [activeGuest, setActiveGuest] = React.useState<SeatGuest | null>(null);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SeatingTableData | null>(null);
  const [pending, setPending] = React.useState(false);

  const stateRef = React.useRef<BoardState>({ tables, unassigned });

  React.useEffect(() => {
    setLocalTables(tables);
    setLocalUnassigned(unassigned);
    stateRef.current = { tables, unassigned };
  }, [tables, unassigned]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TableInput>({ resolver: zodResolver(tableSchema) });

  function snapshot(): BoardState {
    return {
      tables: localTables.map((t) => ({ ...t, guests: [...t.guests] })),
      unassigned: [...localUnassigned],
    };
  }

  function applyState(next: BoardState) {
    setLocalTables(next.tables);
    setLocalUnassigned(next.unassigned);
    stateRef.current = next;
  }

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
    const before = snapshot();
    const res = await saveTableAction(editing?.id ?? null, values);
    setPending(false);

    if (!res.success) {
      toast.error(res.error);
      return;
    }

    if (editing) {
      applyState({
        ...before,
        tables: before.tables.map((t) =>
          t.id === editing.id ? { ...t, name: values.name, capacity: values.capacity } : t,
        ),
      });
    } else {
      const newId = res.data?.id;
      if (newId) {
        applyState({
          ...before,
          tables: [
            ...before.tables,
            { id: newId, name: values.name, capacity: values.capacity, guests: [] },
          ],
        });
      }
    }

    toast.success(res.message ?? "Saved.");
    setOpen(false);
  }

  function handleDragStart(event: DragStartEvent) {
    const guest = event.active.data.current?.guest as SeatGuest | undefined;
    setActiveGuest(guest ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveGuest(null);
    const guestId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;
    if (!overId) return;

    const toTableId = overId === UNASSIGNED_DROP_ID ? null : overId.replace(/^table-/, "");
    void assignGuestToTable(guestId, toTableId);
  }

  async function assignGuestToTable(guestId: string, toTableId: string | null) {
    const before = snapshot();
    const next = moveGuest(before, guestId, toTableId);

    if (!next) {
      if (toTableId) toast.error("Table is at full capacity.");
      return;
    }

    applyState(next);

    const res =
      toTableId === null
        ? await unassignGuestAction(guestId)
        : await assignGuestAction(guestId, toTableId);

    if (!res.success) {
      applyState(before);
      toast.error(res.error);
    }
  }

  async function removeTable(id: string) {
    if (!confirm("Delete this table? Guests will be unassigned.")) return;

    const before = snapshot();
    const removed = before.tables.find((t) => t.id === id);
    if (!removed) return;

    applyState({
      tables: before.tables.filter((t) => t.id !== id),
      unassigned: [...before.unassigned, ...removed.guests],
    });

    const res = await deleteTableAction(id);
    if (!res.success) {
      applyState(before);
      toast.error(res.error);
      return;
    }
    toast.success("Deleted.");
  }

  const shape = watch("shape");

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" /> Unassigned ({localUnassigned.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DroppablePanel id={UNASSIGNED_DROP_ID} className="min-h-[80px] space-y-2 rounded-lg transition-shadow">
              {localUnassigned.length === 0 ? (
                <p className="text-sm text-muted-foreground">Everyone is seated.</p>
              ) : (
                localUnassigned.map((g) => (
                  <DraggableGuest key={g.id} guest={g} className="px-3 py-2" />
                ))
              )}
              <p className="pt-2 text-xs text-muted-foreground">
                Drag guests onto a table. Drop here to unassign.
              </p>
            </DroppablePanel>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Add table
            </Button>
          </div>
          {localTables.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No tables yet. Add your first table to start seating guests.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {localTables.map((t) => {
                const over = t.guests.length > t.capacity;
                return (
                  <Card key={t.id} className={over ? "border-destructive" : ""}>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base">{t.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant={
                            over ? "destructive" : t.guests.length === t.capacity ? "success" : "secondary"
                          }
                        >
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
                    <CardContent>
                      <DroppablePanel
                        id={tableDropId(t.id)}
                        className="min-h-[80px] space-y-1 rounded-lg transition-shadow"
                      >
                        {t.guests.length === 0 ? (
                          <p className="py-4 text-center text-xs text-muted-foreground">Drop guests here</p>
                        ) : (
                          t.guests.map((g) => (
                            <DraggableGuest
                              key={g.id}
                              guest={g}
                              onUnassign={() => void assignGuestToTable(g.id, null)}
                            />
                          ))
                        )}
                      </DroppablePanel>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 160, easing: "cubic-bezier(0.18, 0.67, 0.6, 1)" }}>
        {activeGuest ? <GuestChip guest={activeGuest} isOverlay /> : null}
      </DragOverlay>

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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="round">Round</SelectItem>
                    <SelectItem value="rectangle">Rectangle</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DndContext>
  );
}
