"use client";

import { Progress } from "@/components/ui/progress";

interface Props {
  fileName: string;
  progress: number;
}

export function UploadProgress({ fileName, progress }: Props) {
  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="truncate font-medium">{fileName}</span>
        <span className="shrink-0 text-muted-foreground">{progress}%</span>
      </div>
      <Progress value={progress} />
    </div>
  );
}
