"use client";

import * as React from "react";
import {
  ArrowDownUp,
  ChevronDown,
  CircleAlert,
  Hash,
  LayoutGrid,
  List,
  MessageSquareText,
  Search,
  UtensilsCrossed,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import {
  TablePagination,
  useClientPagination,
} from "@/components/shared/table-pagination";
import { cn } from "@/lib/utils";
import type { GuestResponseRow } from "@/features/guest-responses/types";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

type View = "list" | "cards";
type StatusFilter = "all" | GuestResponseRow["status"];
type SortKey = "newest" | "oldest" | "name-asc" | "name-desc" | "status" | "meal";
type DetailFilter = "allergies" | "message" | "hashtags";

const VIEW_STORAGE_KEY = "guest-responses:view";

const statusVariant: Record<GuestResponseRow["status"], "success" | "destructive" | "warning"> = {
  ACCEPTED: "success",
  DECLINED: "destructive",
  TENTATIVE: "warning",
};

const statusLabel: Record<GuestResponseRow["status"], string> = {
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  TENTATIVE: "Tentative",
};

const statusOrder: Record<GuestResponseRow["status"], number> = {
  ACCEPTED: 0,
  TENTATIVE: 1,
  DECLINED: 2,
};

/** Answers that mean "nothing to note" — not counted as an allergy. */
const EMPTY_ANSWER =
  /^(n\/?a|na|none|no|nope|nothing|wala|-+|—|no allergies?|not applicable|anyy*|nil)\.?!?$/i;

function hasAllergy(value: string | null | undefined) {
  const text = value?.trim() ?? "";
  return text.length > 0 && !EMPTY_ANSWER.test(text);
}

function splitMeals(value: string | null | undefined) {
  return (value ?? "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
}

const NO_PREF = "no preference";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const timeFmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

function formatDate(value: Date | string) {
  const d = new Date(value);
  return `${dateFmt.format(d)} · ${timeFmt.format(d)}`;
}

/* ------------------------------------------------------------------ */
/* Small display pieces                                                */
/* ------------------------------------------------------------------ */

function Dash() {
  return <span className="text-muted-foreground/50">—</span>;
}

function MealChips({ value, highlight }: { value: string | null; highlight?: string | null }) {
  const meals = splitMeals(value);
  if (meals.length === 0) return <Dash />;
  return (
    <div className="flex flex-wrap gap-1">
      {meals.map((meal) => {
        const noPref = meal.toLowerCase() === NO_PREF;
        return (
          <span
            key={meal}
            className={cn(
              "rounded-md px-1.5 py-0.5 text-xs font-medium",
              noPref ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
              highlight === meal && "ring-1 ring-primary",
            )}
          >
            {meal}
          </span>
        );
      })}
    </div>
  );
}

function AllergyText({ value }: { value: string | null }) {
  const text = value?.trim();
  if (!text) return <Dash />;
  if (!hasAllergy(text)) return <span className="text-muted-foreground">{text}</span>;
  return (
    <span className="inline-flex items-start gap-1.5 text-amber-600 dark:text-amber-400">
      <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span className="whitespace-pre-wrap break-words">{text}</span>
    </span>
  );
}

function ClampText({
  value,
  expanded,
  lines = 2,
  className,
}: {
  value: string | null | undefined;
  expanded: boolean;
  lines?: 2 | 3;
  className?: string;
}) {
  const text = value?.trim();
  if (!text) return <Dash />;
  return (
    <p
      className={cn(
        "whitespace-pre-wrap break-words",
        !expanded && (lines === 3 ? "line-clamp-3" : "line-clamp-2"),
        className,
      )}
    >
      {text}
    </p>
  );
}

function Hashtags({ value }: { value: string }) {
  const text = value.trim();
  if (!text) return <Dash />;
  return <p className="break-words text-sm text-sky-600 dark:text-sky-400">{text}</p>;
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

export function GuestResponsesTable({ rows }: { rows: GuestResponseRow[] }) {
  const [view, setView] = React.useState<View>("list");
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [meal, setMeal] = React.useState<string>("all");
  const [details, setDetails] = React.useState<Set<DetailFilter>>(() => new Set());
  const [sort, setSort] = React.useState<SortKey>("newest");
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set());
  const [expandAll, setExpandAll] = React.useState(false);

  // Remember the admin's preferred layout.
  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
      if (saved === "list" || saved === "cards") setView(saved);
    } catch {
      /* storage unavailable */
    }
  }, []);
  function changeView(next: View) {
    setView(next);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      /* storage unavailable */
    }
  }

  /* ---------- summary numbers ---------- */
  const summary = React.useMemo(() => {
    const meals = new Map<string, number>();
    let allergies = 0;
    let messages = 0;
    let hashtags = 0;
    for (const r of rows) {
      if (hasAllergy(r.dietaryRestrictions)) allergies += 1;
      if (r.message.trim()) messages += 1;
      if (r.hashtags.trim()) hashtags += 1;
      if (r.status !== "DECLINED") {
        for (const m of splitMeals(r.mealPreference)) meals.set(m, (meals.get(m) ?? 0) + 1);
      }
    }
    const mealList = [...meals.entries()].sort((a, b) => {
      const aNo = a[0].toLowerCase() === NO_PREF;
      const bNo = b[0].toLowerCase() === NO_PREF;
      if (aNo !== bNo) return aNo ? 1 : -1;
      return b[1] - a[1];
    });
    return { allergies, messages, hashtags, mealList };
  }, [rows]);

  const statusCounts = React.useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: rows.length,
      ACCEPTED: 0,
      DECLINED: 0,
      TENTATIVE: 0,
    };
    for (const r of rows) counts[r.status] += 1;
    return counts;
  }, [rows]);

  /* ---------- filter + sort ---------- */
  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    const list = rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (meal !== "all" && !splitMeals(r.mealPreference).includes(meal)) return false;
      if (details.has("allergies") && !hasAllergy(r.dietaryRestrictions)) return false;
      if (details.has("message") && !r.message.trim()) return false;
      if (details.has("hashtags") && !r.hashtags.trim()) return false;
      if (!term) return true;
      return [r.name, r.mealPreference, r.dietaryRestrictions, r.message, r.hashtags]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });

    const time = (r: GuestResponseRow) => new Date(r.submittedAt).getTime();
    list.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return time(a) - time(b);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "status":
          return statusOrder[a.status] - statusOrder[b.status] || a.name.localeCompare(b.name);
        case "meal":
          return (
            (a.mealPreference ?? "~").localeCompare(b.mealPreference ?? "~") ||
            a.name.localeCompare(b.name)
          );
        case "newest":
        default:
          return time(b) - time(a);
      }
    });
    return list;
  }, [rows, query, status, meal, details, sort]);

  const resetKey = `${query}|${status}|${meal}|${[...details].join()}|${sort}|${view}`;
  const {
    page,
    pageSize,
    pagedItems: visible,
    setPage,
    setPageSize,
  } = useClientPagination(filtered, resetKey, 50);

  const isOpen = (id: string) => expandAll || expanded.has(id);
  function toggleRow(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleDetail(key: DetailFilter) {
    setDetails((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const activeFilters =
    (query.trim() ? 1 : 0) + (status !== "all" ? 1 : 0) + (meal !== "all" ? 1 : 0) + details.size;

  function clearFilters() {
    setQuery("");
    setStatus("all");
    setMeal("all");
    setDetails(new Set());
  }

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
      {/* ---------- Meal tally (click to filter) ---------- */}
      {summary.mealList.length > 0 && (
        <div className="rounded-lg border bg-card p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <UtensilsCrossed className="h-3.5 w-3.5" />
            Meal count
            <span className="font-normal normal-case tracking-normal">
              · attending guests, click to filter
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {summary.mealList.map(([name, count]) => {
              const active = meal === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setMeal(active ? "all" : name)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:border-primary/40 hover:bg-accent",
                  )}
                >
                  {name}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-xs font-semibold tabular-nums",
                      active ? "bg-primary-foreground/20" : "bg-muted",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------- Toolbar ---------- */}
      <div className="space-y-3 rounded-lg border bg-card p-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, meal, allergy, message, hashtag…"
              className="pl-8"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={meal} onValueChange={setMeal}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Meal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All meals</SelectItem>
                {summary.mealList.map(([name]) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-[170px]">
                <ArrowDownUp className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="name-asc">Name A–Z</SelectItem>
                <SelectItem value="name-desc">Name Z–A</SelectItem>
                <SelectItem value="status">RSVP status</SelectItem>
                <SelectItem value="meal">Meal</SelectItem>
              </SelectContent>
            </Select>

            <div className="inline-flex rounded-md border p-0.5" role="group" aria-label="Layout">
              {(
                [
                  { key: "list", icon: List, label: "List" },
                  { key: "cards", icon: LayoutGrid, label: "Cards" },
                ] as const
              ).map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => changeView(v.key)}
                  aria-pressed={view === v.key}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-sm transition-colors",
                    view === v.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <v.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{v.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", "ACCEPTED", "DECLINED", "TENTATIVE"] as const)
            .filter((key) => key === "all" || statusCounts[key] > 0)
            .map((key) => (
              <FilterChip
                key={key}
                active={status === key}
                onClick={() => setStatus(key)}
                count={statusCounts[key]}
              >
                {key === "all" ? "All" : statusLabel[key]}
              </FilterChip>
            ))}
          <span className="mx-1 h-5 w-px bg-border" />
          <FilterChip
            active={details.has("allergies")}
            onClick={() => toggleDetail("allergies")}
            count={summary.allergies}
            icon={CircleAlert}
          >
            Has allergies
          </FilterChip>
          <FilterChip
            active={details.has("message")}
            onClick={() => toggleDetail("message")}
            count={summary.messages}
            icon={MessageSquareText}
          >
            Has message
          </FilterChip>
          <FilterChip
            active={details.has("hashtags")}
            onClick={() => toggleDetail("hashtags")}
            count={summary.hashtags}
            icon={Hash}
          >
            Has hashtag
          </FilterChip>

          <div className="ml-auto flex items-center gap-1">
            {activeFilters > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-3.5 w-3.5" /> Clear filters
              </Button>
            )}
            {view === "list" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setExpandAll((v) => !v);
                  setExpanded(new Set());
                }}
              >
                <ChevronDown
                  className={cn("h-3.5 w-3.5 transition-transform", expandAll && "rotate-180")}
                />
                {expandAll ? "Collapse all" : "Expand all"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{filtered.length}</span> of{" "}
        {rows.length} responses
      </p>

      {/* ---------- Results ---------- */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-12 text-center">
          <p className="text-sm text-muted-foreground">No responses match these filters.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : view === "cards" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((row) => (
            <ResponseCard key={row.id} row={row} highlightMeal={meal === "all" ? null : meal} />
          ))}
        </div>
      ) : (
        <ResponseList
          rows={visible}
          isOpen={isOpen}
          onToggle={toggleRow}
          highlightMeal={meal === "all" ? null : meal}
        />
      )}

      <TablePagination
        page={page}
        pageSize={pageSize}
        total={filtered.length}
        noun="response"
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Filter chip                                                         */
/* ------------------------------------------------------------------ */

function FilterChip({
  active,
  onClick,
  count,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
      <span className="tabular-nums opacity-70">{count}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* List view                                                           */
/* ------------------------------------------------------------------ */

function ResponseList({
  rows,
  isOpen,
  onToggle,
  highlightMeal,
}: {
  rows: GuestResponseRow[];
  isOpen: (id: string) => boolean;
  onToggle: (id: string) => void;
  highlightMeal: string | null;
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      {/* Desktop table */}
      <table className="hidden w-full table-fixed text-sm md:table">
        <colgroup>
          <col className="w-[20%]" />
          <col className="w-[16%]" />
          <col className="w-[16%]" />
          <col />
          <col className="w-[15%]" />
          <col className="w-10" />
        </colgroup>
        <thead className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground">
          <tr>
            <th className="px-3 py-2.5 font-medium">Guest</th>
            <th className="px-3 py-2.5 font-medium">Meal</th>
            <th className="px-3 py-2.5 font-medium">Allergies / Dietary</th>
            <th className="px-3 py-2.5 font-medium">Message</th>
            <th className="px-3 py-2.5 font-medium">Hashtags</th>
            <th className="px-3 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => {
            const open = isOpen(row.id);
            return (
              <tr
                key={row.id}
                onClick={() => onToggle(row.id)}
                className={cn(
                  "cursor-pointer align-top transition-colors hover:bg-muted/40",
                  open && "bg-muted/30",
                )}
              >
                <td className="px-3 py-3">
                  <div className="font-medium leading-snug">{row.name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge variant={statusVariant[row.status]}>{statusLabel[row.status]}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatDate(row.submittedAt)}
                  </div>
                </td>
                <td className="px-3 py-3">
                  {row.status === "DECLINED" ? (
                    <Dash />
                  ) : (
                    <MealChips value={row.mealPreference} highlight={highlightMeal} />
                  )}
                </td>
                <td className="px-3 py-3">
                  <div className={cn(!open && "line-clamp-3")}>
                    <AllergyText value={row.dietaryRestrictions} />
                  </div>
                </td>
                <td className="px-3 py-3 text-muted-foreground">
                  <ClampText value={row.message} expanded={open} lines={3} />
                </td>
                <td className="px-3 py-3">
                  <div className={cn(!open && "line-clamp-2")}>
                    <Hashtags value={row.hashtags} />
                  </div>
                </td>
                <td className="px-2 py-3 text-muted-foreground">
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
                    aria-label={open ? "Collapse" : "Expand"}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Phone list */}
      <ul className="divide-y md:hidden">
        {rows.map((row) => {
          const open = isOpen(row.id);
          return (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => onToggle(row.id)}
                className="flex w-full items-start gap-3 px-3 py-3 text-left"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium leading-snug">{row.name}</span>
                    <Badge variant={statusVariant[row.status]}>{statusLabel[row.status]}</Badge>
                  </div>
                  {row.status !== "DECLINED" && (
                    <MealChips value={row.mealPreference} highlight={highlightMeal} />
                  )}
                  {open ? (
                    <div className="space-y-2 pt-1 text-sm">
                      <DetailLine label="Allergies / Dietary">
                        <AllergyText value={row.dietaryRestrictions} />
                      </DetailLine>
                      <DetailLine label="Message">
                        <ClampText value={row.message} expanded />
                      </DetailLine>
                      <DetailLine label="Hashtags">
                        <Hashtags value={row.hashtags} />
                      </DetailLine>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(row.submittedAt)}
                      </p>
                    </div>
                  ) : (
                    row.message.trim() && (
                      <p className="line-clamp-1 text-sm text-muted-foreground">{row.message}</p>
                    )
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    open && "rotate-180",
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card view — every detail shown in full                              */
/* ------------------------------------------------------------------ */

function DetailLine({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function ResponseCard({
  row,
  highlightMeal,
}: {
  row: GuestResponseRow;
  highlightMeal: string | null;
}) {
  const allergy = hasAllergy(row.dietaryRestrictions);
  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-4",
        allergy && "border-amber-500/40",
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold leading-snug">{row.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(row.submittedAt)}</p>
        </div>
        <Badge variant={statusVariant[row.status]}>{statusLabel[row.status]}</Badge>
      </header>

      {row.status !== "DECLINED" && (
        <DetailLine label="Meal">
          <MealChips value={row.mealPreference} highlight={highlightMeal} />
        </DetailLine>
      )}

      <DetailLine label="Allergies / Dietary">
        <AllergyText value={row.dietaryRestrictions} />
      </DetailLine>

      <DetailLine label="Message">
        {row.message.trim() ? (
          <blockquote className="whitespace-pre-wrap break-words border-l-2 border-primary/40 pl-3 text-muted-foreground">
            {row.message.trim()}
          </blockquote>
        ) : (
          <Dash />
        )}
      </DetailLine>

      {row.hashtags.trim() && (
        <DetailLine label="Hashtags">
          <Hashtags value={row.hashtags} />
        </DetailLine>
      )}
    </article>
  );
}
