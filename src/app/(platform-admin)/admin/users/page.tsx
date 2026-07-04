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

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { ownedWeddings: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="All registered accounts" />
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Weddings</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name ?? "—"}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell><Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>{u.role}</Badge></TableCell>
                <TableCell>
                  {u.emailVerified ? (
                    <Badge variant="success">Verified</Badge>
                  ) : (
                    <Badge variant="warning">Pending</Badge>
                  )}
                </TableCell>
                <TableCell>{u._count.ownedWeddings}</TableCell>
                <TableCell>{formatDate(u.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
