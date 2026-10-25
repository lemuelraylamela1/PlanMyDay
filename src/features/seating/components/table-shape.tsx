"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";

import { cn } from "@/lib/utils";
import {
  buildSeatSlots,
  occupiedSeats,
  seatDragId,
  seatPositions,
  seatSlotDropId,
  type SeatGuest,
  type SeatSlot,
  type TableShape,
} from "@/features/seating/model";

interface TableShapePreviewProps {
  tableId: string;
  shape: TableShape;
  capacity: number;
  guests: SeatGuest[];
  className?: string;
}

function slotClass(side: SeatGuest["side"] | null, filled: boolean, over: boolean) {
  if (!filled) return "border-dashed border-muted-foreground/40 bg-background";
  if (over) return "border-destructive bg-destructive/10 text-destructive";
  if (side === "BRIDE") return "border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-300";
  if (side === "GROOM") return "border-sky-500/40 bg-sky-500/15 text-sky-700 dark:text-sky-300";
  return "border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-300";
}

function SeatMarker({
  slot,
  tableId,
  guest,
  position,
}: {
  slot: SeatSlot;
  tableId: string;
  guest?: SeatGuest;
  position: { left: number; top: number };
}) {
  const canDrag = Boolean(slot.guestId && guest);
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: slot.guestId
      ? seatDragId(slot.guestId, slot.plusOne)
      : `seat-empty:${tableId}:${slot.index}`,
    disabled: !canDrag,
    data: canDrag
      ? {
          kind: "seat" as const,
          guestId: guest?.id,
          tableId,
          plusOne: slot.plusOne,
          guest:
            slot.plusOne && guest ? { ...guest, name: guest.plusOneName || guest.name } : guest,
        }
      : undefined,
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: seatSlotDropId(tableId, slot.index),
    data: { kind: "seat-slot" as const, tableId, index: slot.index },
  });
  const title = slot.plusOne
    ? `${slot.name}, plus one. Drag to another seat.`
    : slot.filled
      ? `${slot.name}. Drag to another seat.`
      : "Open seat";

  return (
    <div
      ref={(node) => {
        setDragRef(node);
        setDropRef(node);
      }}
      title={title}
      style={{ left: `${position.left}%`, top: `${position.top}%` }}
      className={cn(
        "absolute z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[11px] font-semibold",
        slot.plusOne && "h-7 w-7 text-[10px]",
        slotClass(slot.side, slot.filled, slot.over),
        canDrag && "cursor-grab touch-none select-none active:cursor-grabbing",
        isDragging && "opacity-40",
        isOver && "z-20 ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
      {...(canDrag ? listeners : undefined)}
      {...(canDrag ? attributes : undefined)}
    >
      {slot.initials}
    </div>
  );
}

export function TableShapePreview({
  tableId,
  shape,
  capacity,
  guests,
  className,
}: TableShapePreviewProps) {
  const slots = buildSeatSlots(guests, capacity);
  const positions = seatPositions(slots.length, shape);
  const showDots = slots.length > 0 && slots.length <= 12;
  const used = occupiedSeats(guests);
  const over = used > capacity;
  const guestsById = new Map(guests.map((guest) => [guest.id, guest]));

  return (
    <div>
      <div
        className={cn(
          "relative mx-auto",
          shape === "rectangle" ? "h-36 w-full max-w-xs" : "h-40 w-40",
          className,
        )}
      >
        <div
          className={cn(
            "absolute border bg-primary/[0.04]",
            shape === "round" && "inset-[24%] rounded-full",
            shape === "square" && "inset-[24%] rounded-lg",
            shape === "rectangle" && "inset-x-[8%] inset-y-[28%] rounded-lg",
            over ? "border-destructive/60" : "border-border",
          )}
        />
        {!showDots && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center text-xs font-medium",
              over ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {used}/{capacity}
          </div>
        )}
        {showDots &&
          slots.map((slot, index) => {
            const position = positions[index];
            if (!position) return null;
            return (
              <SeatMarker
                key={slot.key}
                slot={slot}
                tableId={tableId}
                guest={slot.guestId ? guestsById.get(slot.guestId) : undefined}
                position={position}
              />
            );
          })}
      </div>
      {showDots && guests.length > 0 && (
        <p className="mt-1 text-center text-[11px] text-muted-foreground">
          Drag a name onto another seat.
        </p>
      )}
    </div>
  );
}
