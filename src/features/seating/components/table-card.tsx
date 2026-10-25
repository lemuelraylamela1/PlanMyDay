"use client";

import { useDroppable } from "@dnd-kit/core";
import { Pencil, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GuestRow } from "@/features/seating/components/guest-row";
import { TableShapePreview } from "@/features/seating/components/table-shape";
import {
  canPlaceGuest,
  guestHighlighted,
  occupancyLabel,
  occupiedSeats,
  shapeLabel,
  tableDropId,
  tableHighlighted,
  type SeatGuest,
  type SeatingTableData,
} from "@/features/seating/model";

interface TableCardProps {
  table: SeatingTableData;
  tables: SeatingTableData[];
  query: string;
  activeGuest: SeatGuest | null;
  onEdit: () => void;
  onDelete: () => void;
  onPlace: (guestId: string, tableId: string | null) => void;
}

export function TableCard({
  table,
  tables,
  query,
  activeGuest,
  onEdit,
  onDelete,
  onPlace,
}: TableCardProps) {
  const { setNodeRef, isOver } = useDroppable({ id: tableDropId(table.id) });
  const used = occupiedSeats(table.guests);
  const open = table.capacity - used;
  const over = open < 0;
  const plusOnes = used - table.guests.length;
  const alreadyHere = activeGuest
    ? table.guests.some((guest) => guest.id === activeGuest.id)
    : false;
  const canDrop = activeGuest ? canPlaceGuest(table, activeGuest) : false;
  const showDrop = Boolean(isOver && activeGuest && !alreadyHere);
  const fill = table.capacity === 0 ? 0 : Math.min(100, (used / table.capacity) * 100);
  const subtitle = [
    shapeLabel(table.shape),
    occupancyLabel(open),
    plusOnes > 0 ? `${plusOnes} plus ${plusOnes === 1 ? "one" : "ones"}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card
      className={cn(
        "transition-shadow",
        over ? "border-destructive" : tableHighlighted(table, query) && "border-primary",
        showDrop &&
          canDrop &&
          "bg-primary/5 ring-2 ring-primary ring-offset-2 ring-offset-background",
        showDrop &&
          !canDrop &&
          "bg-destructive/5 ring-2 ring-destructive ring-offset-2 ring-offset-background",
      )}
    >
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="truncate text-base" title={table.name}>
              {table.name}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Badge variant={over ? "destructive" : open === 0 ? "success" : "secondary"}>
              {used}/{table.capacity}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onEdit}
              aria-label={`Edit ${table.name}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDelete}
              aria-label={`Delete ${table.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Progress
          value={fill}
          aria-label={`${table.name} is ${used} of ${table.capacity} seats filled`}
        />
      </CardHeader>
      <CardContent className="space-y-3">
        <TableShapePreview
          tableId={table.id}
          shape={table.shape}
          capacity={table.capacity}
          guests={table.guests}
        />
        <div ref={setNodeRef} className="max-h-80 min-h-24 space-y-1 overflow-y-auto">
          {table.guests.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">Drop guests here</p>
          ) : (
            table.guests.map((guest) => (
              <GuestRow
                key={guest.id}
                guest={guest}
                tables={tables}
                currentTableId={table.id}
                highlighted={guestHighlighted(guest, query)}
                onPlace={(tableId) => onPlace(guest.id, tableId)}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
