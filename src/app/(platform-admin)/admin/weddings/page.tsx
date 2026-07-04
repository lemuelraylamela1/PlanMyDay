import type { Metadata } from "next";

import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Weddings" };

export default async function AdminWeddingsPage() {
  const weddings = await db.wedding.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      owner: { select: { name: true, email: true } },
      _count: { select: { guests: true } },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Weddings" description="All active weddings on the platform" />
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weddings.map((w) => (
              <TableRow key={w.id}>
                <TableCell className="font-medium">{w.title}</TableCell>
                <TableCell>{w.owner.name ?? w.owner.email}</TableCell>
                <TableCell>{w.date ? formatDate(w.date) : "—"}</TableCell>
                <TableCell><Badge variant="secondary">{w.status}</Badge></TableCell>
                <TableCell>{w._count.guests}</TableCell>
                <TableCell>{formatDate(w.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
