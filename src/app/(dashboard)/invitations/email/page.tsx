import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmailManager, type EmailTemplateRow } from "@/features/email/components/email-manager";
import { availablePlaceholders } from "@/features/invitations/placeholders";

export const metadata: Metadata = { title: "Email" };

export default async function EmailPage() {
  const { wedding } = await getCurrentWedding();
  const [templates, logs] = await Promise.all([
    db.emailTemplate.findMany({
      where: { weddingId: wedding.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
    }),
    db.emailDeliveryLog.findMany({
      where: { weddingId: wedding.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const rows: EmailTemplateRow[] = templates.map((t) => ({
    id: t.id,
    name: t.name,
    kind: t.kind,
    subject: t.subject,
    body: t.body,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/invitations"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <PageHeader title="Email" description="Templates and delivery logs" className="mb-0" />
      </div>

      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Delivery logs</TabsTrigger>
        </TabsList>
        <TabsContent value="templates" className="mt-6">
          <EmailManager templates={rows} placeholders={availablePlaceholders()} />
        </TabsContent>
        <TabsContent value="logs" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Recent deliveries</CardTitle></CardHeader>
            <CardContent className="p-0">
              {logs.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">No emails sent yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>To</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell>{l.toEmail}</TableCell>
                        <TableCell className="max-w-xs truncate">{l.subject}</TableCell>
                        <TableCell>
                          <Badge variant={l.status === "SENT" ? "success" : "destructive"}>
                            {l.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{l.sentAt ? formatDate(l.sentAt) : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
