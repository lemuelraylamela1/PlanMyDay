"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { SearchResult } from "@/features/search/service";

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  React.useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full max-w-sm justify-start gap-2 text-muted-foreground"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search everything…</span>
          <kbd className="ml-auto hidden rounded border bg-muted px-1.5 text-xs sm:inline">
            Ctrl K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="top-24 translate-y-0 gap-3 p-4">
        <DialogHeader>
          <DialogTitle className="sr-only">Search</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Search guests, suppliers, tasks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
          {!loading && query.length >= 2 && results.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">No results found.</p>
          )}
          <div className="space-y-1">
            {results.map((r) => (
              <button
                key={`${r.type}-${r.id}`}
                onClick={() => go(r.href)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
              >
                <span className="truncate">
                  <span className="font-medium">{r.title}</span>
                  {r.subtitle && (
                    <span className="ml-2 text-xs text-muted-foreground">{r.subtitle}</span>
                  )}
                </span>
                <Badge variant="secondary">{r.type}</Badge>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
