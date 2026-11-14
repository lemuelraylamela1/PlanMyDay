"use client";

import * as React from "react";
import { MessageSquareText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import {
  TablePagination,
  useClientPagination,
} from "@/components/shared/table-pagination";
import type { GuestResponseRow } from "@/features/guest-responses/types";

const statusVariant: Record<
  GuestResponseRow["status"],
  "success" | "destructive" | "warning"
> = {
  ACCEPTED: "success",
  DECLINED: "destructive",
  TENTATIVE: "warning",
};

const PREVIEW_CHARS = 72;

function ExpandableText({
  value,
  title,
  className,
}: {
  value: string | null | undefined;
  title: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const text = value?.trim() ?? "";

  if (!text) {
    return <span className={className}>—</span>;
  }

  const needsMore = text.length > PREVIEW_CHARS;
  const preview = needsMore ? `${text.slice(0, PREVIEW_CHARS).trimEnd()}…` : text;

  return (
    <>
      <div className={className}>
        <span className="break-words">{preview}</span>
        {needsMore ? (
          <>
            {" "}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              more
            </button>
          </>
        ) : null}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
            {text}
          </p>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function GuestResponsesTable({ rows }: { rows: GuestResponseRow[] }) {
  const {
    page,
    pageSize,
    pagedItems: visible,
    setPage,
    setPageSize,
  } = useClientPagination(rows);

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={MessageSquareText}
        title="No guest responses yet"
        description="When guests submit their RSVP, their meal preferences, dietary needs, messages, and hashtags will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>RSVP</TableHead>
              <TableHead>Meal preference</TableHead>
              <TableHead>Allergies / Dietary</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Hashtags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[row.status]}>
                    {row.status.charAt(0) + row.status.slice(1).toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[160px] text-sm text-muted-foreground">
                  <ExpandableText
                    value={row.mealPreference}
                    title={`Meal preference — ${row.name}`}
                  />
                </TableCell>
                <TableCell className="max-w-[200px] text-sm text-muted-foreground">
                  <ExpandableText
                    value={row.dietaryRestrictions}
                    title={`Allergies / Dietary — ${row.name}`}
                  />
                </TableCell>
                <TableCell className="max-w-[240px] text-sm text-muted-foreground">
                  <ExpandableText
                    value={row.message}
                    title={`Message — ${row.name}`}
                  />
                </TableCell>
                <TableCell className="max-w-[180px] text-sm text-muted-foreground">
                  <ExpandableText
                    value={row.hashtags}
                    title={`Hashtags — ${row.name}`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        page={page}
        pageSize={pageSize}
        total={rows.length}
        noun="response"
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
