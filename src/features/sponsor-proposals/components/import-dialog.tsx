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
import {
  importSponsorProposalsAction,
  type CsvEntourageRow,
} from "@/features/sponsor-proposals/actions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function normalizeKey(key: string) {
  return key.toLowerCase().replace(/[\s_-]/g, "");
}

export function EntourageImportDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [rows, setRows] = React.useState<CsvEntourageRow[]>([]);
  const [pending, setPending] = React.useState(false);
  const [fileName, setFileName] = React.useState("");

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsed: CsvEntourageRow[] = result.data.map((raw) => {
          const mapped: Record<string, string> = {};
          for (const [key, value] of Object.entries(raw)) {
            mapped[normalizeKey(key)] = value;
          }
          return {
            name: mapped.name ?? mapped.fullname,
            role: mapped.role ?? mapped.rolecode ?? mapped.entouragerole,
            email: mapped.email,
            phone: mapped.phone ?? mapped.mobile,
            facebookLink:
              mapped.facebooklink ??
              mapped.facebook ??
              mapped.facebookurl ??
              mapped.fb,
            customMessage:
              mapped.custommessage ??
              mapped.message ??
              mapped.proposalmessage,
          };
        });
        setRows(parsed.filter((row) => Boolean(row.name?.trim())));
      },
      error: () => toast.error("Could not parse this CSV file."),
    });
  }

  async function onImport() {
    if (rows.length === 0) {
      toast.error("No valid rows found. Ensure a name column exists.");
      return;
    }
    setPending(true);
    const result = await importSponsorProposalsAction(rows);
    setPending(false);
    if (result.success) {
      toast.success(result.message ?? "Imported.");
      setRows([]);
      setFileName("");
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import entourage from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV with columns like name, role, email, phone, facebookLink,
            customMessage. Missing messages use the default proposal text for each role.
          </DialogDescription>
        </DialogHeader>

        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center hover:bg-accent/50">
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-medium">
            {fileName || "Choose a CSV file"}
          </span>
          <span className="text-xs text-muted-foreground">
            {rows.length > 0
              ? `${rows.length} valid rows detected`
              : "Click to browse"}
          </span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFile}
          />
        </label>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onImport} disabled={pending || rows.length === 0}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Import {rows.length > 0 ? `${rows.length} members` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
