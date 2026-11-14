"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type SortOrder = "asc" | "desc";

export function SortIcon({ active, order }: { active: boolean; order: SortOrder }) {
  if (!active) return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />;
  return order === "asc" ? (
    <ArrowUp className="h-3.5 w-3.5" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5" />
  );
}

export function SortableTableHead({
  label,
  active,
  order,
  onSort,
  className,
  align = "left",
}: {
  label: string;
  active: boolean;
  order: SortOrder;
  onSort: () => void;
  className?: string;
  align?: "left" | "right";
}) {
  return (
    <TableHead
      aria-sort={active ? (order === "asc" ? "ascending" : "descending") : "none"}
      className={cn(align === "right" && "text-right", className)}
    >
      <button
        type="button"
        className={cn(
          "inline-flex cursor-pointer items-center gap-1 whitespace-nowrap font-medium hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
          align === "right" && "w-full justify-end",
        )}
        onClick={onSort}
      >
        {label}
        <SortIcon active={active} order={order} />
      </button>
    </TableHead>
  );
}

export function compareText(
  a: string | null | undefined,
  b: string | null | undefined,
  direction: number,
) {
  const left = (a ?? "").trim();
  const right = (b ?? "").trim();
  if (!left && !right) return 0;
  if (!left) return 1;
  if (!right) return -1;
  return left.localeCompare(right, undefined, { sensitivity: "base" }) * direction;
}

export function compareDate(
  a: string | null | undefined,
  b: string | null | undefined,
  direction: number,
) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return (new Date(a).getTime() - new Date(b).getTime()) * direction;
}
