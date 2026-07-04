"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { importGuestsAction } from "@/features/guests/actions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParsedRow {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  side?: string;
  relationship?: string;
  group?: string;
}

function normalizeKey(key: string) {
  return key.toLowerCase().replace(/[\s_-]/g, "");
}

export function ImportDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [rows, setRows] = React.useState<ParsedRow[]>([]);
  const [pending, setPending] = React.useState(false);
  const [fileName, setFileName] = React.useState("");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsed: ParsedRow[] = result.data.map((raw) => {
          const mapped: Record<string, string> = {};
          for (const [k, v] of Object.entries(raw)) mapped[normalizeKey(k)] = v;
          return {
            firstName: mapped.firstname ?? mapped.first ?? mapped.name,
            lastName: mapped.lastname ?? mapped.last ?? mapped.surname,
            email: mapped.email,
            phone: mapped.phone ?? mapped.mobile,
            side: mapped.side,
            relationship: mapped.relationship ?? mapped.relation,
            group: mapped.group ?? mapped.family,
          };
        });
        setRows(parsed.filter((r) => r.firstName && r.lastName));
      },
      error: () => toast.error("Could not parse this CSV file."),
    });
  }

  async function onImport() {
    if (rows.length === 0) {
      toast.error("No valid rows found. Ensure firstName and lastName columns exist.");
      return;
    }
    setPending(true);
    const res = await importGuestsAction(rows);
    setPending(false);
    if (res.success) {
      toast.success(res.message ?? "Imported.");
      setRows([]);
      setFileName("");
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import guests from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV with columns like firstName, lastName, email, phone, side, group.
          </DialogDescription>
        </DialogHeader>

        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center hover:bg-accent/50">
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-medium">{fileName || "Choose a CSV file"}</span>
          <span className="text-xs text-muted-foreground">
            {rows.length > 0 ? `${rows.length} valid rows detected` : "Click to browse"}
          </span>
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
        </label>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onImport} disabled={pending || rows.length === 0}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Import {rows.length > 0 ? `${rows.length} guests` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
