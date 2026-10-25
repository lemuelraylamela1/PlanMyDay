import { cn } from "@/lib/utils";
import {
  buildSeatSlots,
  occupiedSeats,
  seatPositions,
  type SeatGuest,
  type TableShape,
} from "@/features/seating/model";

interface TableShapePreviewProps {
  shape: TableShape;
  capacity: number;
  guests: SeatGuest[];
  className?: string;
}

function slotClass(side: SeatGuest["side"] | null, filled: boolean, over: boolean) {
  if (!filled) return "border-dashed border-muted-foreground/30 bg-background";
  if (over) return "border-destructive bg-destructive/10 text-destructive";
  if (side === "BRIDE") return "border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-300";
  if (side === "GROOM") return "border-sky-500/40 bg-sky-500/15 text-sky-700 dark:text-sky-300";
  return "border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-300";
}

export function TableShapePreview({ shape, capacity, guests, className }: TableShapePreviewProps) {
  const slots = buildSeatSlots(guests, capacity);
  const positions = seatPositions(slots.length, shape);
  const showDots = slots.length > 0 && slots.length <= 12;
  const used = occupiedSeats(guests);
  const over = used > capacity;

  return (
    <div
      aria-hidden
      className={cn(
        "relative mx-auto",
        shape === "rectangle" ? "h-24 w-full max-w-xs" : "h-32 w-32",
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
          const title = slot.plusOne ? `${slot.name} (plus one)` : slot.name;
          return (
            <span
              key={slot.key}
              title={title}
              className={cn(
                "absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border font-semibold",
                slot.plusOne ? "h-4 w-4 text-[8px]" : "h-5 w-5 text-[9px]",
                slotClass(slot.side, slot.filled, slot.over),
              )}
              style={{ left: `${position.left}%`, top: `${position.top}%` }}
            >
              {slot.initials}
            </span>
          );
        })}
    </div>
  );
}
