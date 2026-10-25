"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Armchair, CircleDot, Download, Loader2, Plus, UserCheck, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  assignGuestAction,
  assignGuestsAction,
  deleteTableAction,
  reorderSeatsAction,
  saveTableAction,
  unassignGuestAction,
} from "@/features/seating/actions";
import { exportSeatingChartPdf } from "@/features/seating/seating-export";
import { TableCard } from "@/features/seating/components/table-card";
import { UnassignedPanel } from "@/features/seating/components/unassigned-panel";
import {
  compareGuests,
  findGuest,
  moveGuest,
  moveGuestToSeat,
  moveGuests,
  occupiedSeats,
  parseSeatSlotDropId,
  partySize,
  sideDotClass,
  sideLabel,
  tableIdFromDropId,
  UNASSIGNED_DROP_ID,
  type BoardState,
  type GuestSide,
  type SeatGuest,
  type SeatingTableData,
} from "@/features/seating/model";

interface Props {
  tables: SeatingTableData[];
  unassigned: SeatGuest[];
  weddingTitle: string;
}

function cloneState(state: BoardState): BoardState {
  return {
    tables: state.tables.map((table) => ({ ...table, guests: [...table.guests] })),
    unassigned: [...state.unassigned],
  };
}

const seatingCollision: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  const slots = hits.filter((hit) => String(hit.id).startsWith("slot:"));
  if (slots.length > 0) return slots;
  if (hits.length > 0) return hits;
  return rectIntersection(args);
};

function fullMessage(guest: SeatGuest | undefined) {
  if (guest && partySize(guest) > 1) {
    return `${guest.name} needs ${partySize(guest)} seats, including their plus one.`;
  }
  return "That table doesn't have an open seat.";
}

export function SeatingBoard({ tables, unassigned, weddingTitle }: Props) {
  const [localTables, setLocalTables] = React.useState(tables);
  const [localUnassigned, setLocalUnassigned] = React.useState(unassigned);
  const [activeGuest, setActiveGuest] = React.useState<SeatGuest | null>(null);
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SeatingTableData | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<SeatingTableData | null>(null);
  const [pending, setPending] = React.useState(false);
  const [deletePending, setDeletePending] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  const stateRef = React.useRef<BoardState>({ tables, unassigned });
  const queueRef = React.useRef(Promise.resolve());

  React.useEffect(() => {
    setLocalTables(tables);
    setLocalUnassigned(unassigned);
    stateRef.current = { tables, unassigned };
  }, [tables, unassigned]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TableInput>({ resolver: zodResolver(tableSchema) });

  const shape = watch("shape");
  const capacityValue = Number(watch("capacity"));
  const seatsInUse = editing ? occupiedSeats(editing.guests) : 0;

  function applyState(next: BoardState) {
    stateRef.current = next;
    setLocalTables(next.tables);
    setLocalUnassigned(next.unassigned);
  }

  function enqueue(task: () => Promise<void>) {
    const run = queueRef.current.then(task, task);
    queueRef.current = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  function openCreate() {
    setEditing(null);
    reset({ name: `Table ${localTables.length + 1}`, capacity: 8, shape: "round" });
    setOpen(true);
  }

  function openEdit(table: SeatingTableData) {
    setEditing(table);
    reset({ name: table.name, capacity: table.capacity, shape: table.shape });
    setOpen(true);
  }

  async function onSubmit(values: TableInput) {
    setPending(true);
    const editingId = editing?.id ?? null;
    const before = cloneState(stateRef.current);
    const res = await saveTableAction(editingId, values);
    setPending(false);

    if (!res.success) {
      toast.error(res.error);
      return;
    }

    if (editingId) {
      applyState({
        ...before,
        tables: before.tables.map((table) =>
          table.id === editingId
            ? { ...table, name: values.name, capacity: values.capacity, shape: values.shape }
            : table,
        ),
      });
    } else if (res.data?.id) {
      applyState({
        ...before,
        tables: [
          ...before.tables,
          {
            id: res.data.id,
            name: values.name,
            capacity: values.capacity,
            shape: values.shape,
            guests: [],
          },
        ],
      });
    }

    toast.success(res.message ?? "Table saved.");
    setOpen(false);
  }

  function handleDragStart(event: DragStartEvent) {
    const fromData = event.active.data.current?.guest as SeatGuest | undefined;
    setActiveGuest(fromData ?? findGuest(stateRef.current, String(event.active.id)) ?? null);
  }

  function handleDragCancel() {
    setActiveGuest(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveGuest(null);
    const dropId = event.over ? String(event.over.id) : null;
    if (!dropId) return;
    const data = event.active.data.current;

    if (data?.kind === "seat") {
      const guestId = String(data.guestId ?? "");
      const fromTableId = String(data.tableId ?? "");
      const slot = parseSeatSlotDropId(dropId);
      if (slot && slot.tableId === fromTableId) {
        void reorderSeat(fromTableId, guestId, slot.index, Boolean(data.plusOne));
        return;
      }
      const toTableId =
        dropId === UNASSIGNED_DROP_ID ? null : (slot?.tableId ?? tableIdFromDropId(dropId));
      if (dropId === UNASSIGNED_DROP_ID || toTableId) {
        void assignGuestToTable(guestId, toTableId);
      }
      return;
    }

    const guestId = String(event.active.id);
    const toTableId = dropId === UNASSIGNED_DROP_ID ? null : tableIdFromDropId(dropId);
    if (dropId !== UNASSIGNED_DROP_ID && !toTableId) return;
    void assignGuestToTable(guestId, toTableId);
  }

  function reorderSeat(
    tableId: string,
    guestId: string,
    toIndex: number,
    draggingPlusOne: boolean,
  ) {
    return enqueue(async () => {
      const before = cloneState(stateRef.current);
      const table = before.tables.find((item) => item.id === tableId);
      if (!table) return;
      const result = moveGuestToSeat(
        table.guests,
        guestId,
        toIndex,
        table.capacity,
        draggingPlusOne,
      );
      if (result === "same") return;
      if (result === "blocked") {
        const guest = table.guests.find((item) => item.id === guestId);
        toast.error(
          guest && partySize(guest) > 1
            ? "Leave two open seats together so this guest and their plus one can move."
            : "There isn't room to move into that seat.",
        );
        return;
      }

      const next = {
        ...before,
        tables: before.tables.map((item) =>
          item.id === tableId ? { ...item, guests: result.guests } : item,
        ),
      };
      applyState(next);
      const seats = result.guests.flatMap((guest) =>
        guest.seatNumber == null ? [] : [{ guestId: guest.id, seatNumber: guest.seatNumber }],
      );
      const res = await reorderSeatsAction(tableId, seats);
      if (!res.success) {
        applyState(before);
        toast.error(res.error);
      }
    });
  }

  function assignGuestToTable(
    guestId: string,
    toTableId: string | null,
    options?: { announce?: boolean },
  ) {
    return enqueue(async () => {
      const before = cloneState(stateRef.current);
      const next = moveGuest(before, guestId, toTableId);
      if (next === "missing" || next === before) return;
      if (next === "full") {
        toast.error(fullMessage(findGuest(before, guestId)));
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
        return;
      }
      if (options?.announce && res.message) toast.success(res.message);
    });
  }

  function seatGroup(guestIds: string[], tableId: string) {
    return enqueue(async () => {
      const before = cloneState(stateRef.current);
      const next = moveGuests(before, guestIds, tableId);
      if (next === "missing" || next === before) return;
      if (next === "full") {
        toast.error("That table doesn't have enough open seats for the whole group.");
        return;
      }

      applyState(next);
      const res = await assignGuestsAction(guestIds, tableId);
      if (!res.success) {
        applyState(before);
        toast.error(res.error);
        return;
      }
      if (res.message) toast.success(res.message);
    });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeletePending(true);
    const before = cloneState(stateRef.current);
    const removed = before.tables.find((table) => table.id === id);
    if (!removed) {
      setDeletePending(false);
      setDeleteTarget(null);
      return;
    }

    applyState({
      tables: before.tables.filter((table) => table.id !== id),
      unassigned: [...before.unassigned, ...removed.guests].sort(compareGuests),
    });

    const res = await deleteTableAction(id);
    setDeletePending(false);
    if (!res.success) {
      applyState(before);
      toast.error(res.error);
      return;
    }
    toast.success(res.message ?? "Table deleted.");
    setDeleteTarget(null);
  }

  async function downloadChart() {
    setExporting(true);
    try {
      await exportSeatingChartPdf({
        weddingTitle,
        tables: stateRef.current.tables,
        unassigned: stateRef.current.unassigned,
      });
    } catch {
      toast.error("Could not create the seating chart.");
    } finally {
      setExporting(false);
    }
  }

  const seatedGuests = localTables.reduce((total, table) => total + table.guests.length, 0);
  const seatedHeads = localTables.reduce((total, table) => total + occupiedSeats(table.guests), 0);
  const totalSeats = localTables.reduce((total, table) => total + table.capacity, 0);
  const seatedPlusOnes = seatedHeads - seatedGuests;
  const unassignedHeads = occupiedSeats(localUnassigned);
  const openSeatCount = totalSeats - seatedHeads;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={seatingCollision}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Tables"
            value={localTables.length}
            icon={Armchair}
            hint={totalSeats > 0 ? `${totalSeats} seats` : undefined}
          />
          <StatCard
            label="Seated"
            value={seatedHeads}
            icon={UserCheck}
            accent="success"
            hint={
              seatedPlusOnes > 0
                ? `${seatedPlusOnes} plus ${seatedPlusOnes === 1 ? "one" : "ones"} included`
                : undefined
            }
          />
          <StatCard
            label="Open seats"
            value={openSeatCount}
            icon={CircleDot}
            accent={
              openSeatCount < 0
                ? "destructive"
                : openSeatCount === 0 && localUnassigned.length > 0
                  ? "warning"
                  : openSeatCount === 0
                    ? "success"
                    : "info"
            }
          />
          <StatCard
            label="Unassigned"
            value={localUnassigned.length}
            icon={Users}
            accent={localUnassigned.length === 0 ? "success" : "warning"}
            hint={
              unassignedHeads !== localUnassigned.length
                ? `${unassignedHeads} seats needed`
                : undefined
            }
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <UnassignedPanel
            guests={localUnassigned}
            tables={localTables}
            query={query}
            activeGuest={activeGuest}
            onQueryChange={setQuery}
            onPlace={(guestId, tableId) =>
              void assignGuestToTable(guestId, tableId, { announce: true })
            }
            onSeatGroup={(guestIds, tableId) => void seatGroup(guestIds, tableId)}
          />

          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {(["BRIDE", "GROOM", "BOTH"] as const satisfies readonly GuestSide[]).map(
                  (side) => (
                    <span key={side} className="inline-flex items-center gap-1.5">
                      <span className={cn("h-2 w-2 rounded-full", sideDotClass(side))} />
                      {sideLabel(side)}
                    </span>
                  ),
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void downloadChart()}
                  disabled={exporting}
                >
                  {exporting ? <Loader2 className="animate-spin" /> : <Download />}
                  Download chart
                </Button>
                <Button type="button" onClick={openCreate}>
                  <Plus /> Add table
                </Button>
              </div>
            </div>

            {localTables.length === 0 ? (
              <EmptyState
                icon={Armchair}
                title="No tables yet"
                description="Add a table, then drag guests onto it or choose Seat on a guest."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {localTables.map((table) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    tables={localTables}
                    query={query}
                    activeGuest={activeGuest}
                    onEdit={() => openEdit(table)}
                    onDelete={() => setDeleteTarget(table)}
                    onPlace={(guestId, tableId) =>
                      void assignGuestToTable(guestId, tableId, { announce: true })
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <DragOverlay
        dropAnimation={{ duration: 160, easing: "cubic-bezier(0.18, 0.67, 0.6, 1)" }}
        className="z-50"
      >
        {activeGuest ? (
          <div className="flex max-w-xs items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm shadow-lg ring-2 ring-primary/40">
            <span className={cn("h-2 w-2 shrink-0 rounded-full", sideDotClass(activeGuest.side))} />
            <span className="truncate font-medium">{activeGuest.name}</span>
            {activeGuest.plusOneName ? (
              <span className="truncate text-xs text-muted-foreground">
                + {activeGuest.plusOneName}
              </span>
            ) : null}
          </div>
        ) : null}
      </DragOverlay>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit table" : "Add table"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the name, size, or shape. Guests stay seated."
                : "Name the table and choose how many people it can hold."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Table name</Label>
              <Input
                id="name"
                autoComplete="off"
                placeholder="e.g. Table 1"
                {...register("name")}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" type="number" min={1} max={50} {...register("capacity")} />
                {errors.capacity && (
                  <p className="text-xs text-destructive">{errors.capacity.message}</p>
                )}
                {editing && Number.isFinite(capacityValue) && capacityValue < seatsInUse && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    This table is already using {seatsInUse} seats.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Shape</Label>
                <Select
                  value={shape ?? "round"}
                  onValueChange={(value) => setValue("shape", value as TableInput["shape"])}
                >
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
                {pending && <Loader2 className="animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(next) => {
          if (!next && !deletePending) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteTarget?.name}?</DialogTitle>
            <DialogDescription>
              Guests at this table return to the unassigned list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deletePending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void confirmDelete()}
              disabled={deletePending}
            >
              {deletePending && <Loader2 className="animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndContext>
  );
}
