import type { Metadata } from "next";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeddingDetailsForm } from "@/features/weddings/components/wedding-details-form";
import { AppearanceForm } from "@/features/weddings/components/appearance-form";

export const metadata: Metadata = { title: "Wedding" };

function dateInput(value: Date | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}
function dateTimeInput(value: Date | null) {
  return value ? new Date(value).toISOString().slice(0, 16) : "";
}

export default async function WeddingPage() {
  const { wedding } = await getCurrentWedding();
  const settings = await db.weddingSettings.findUnique({ where: { weddingId: wedding.id } });

  return (
    <div className="space-y-6">
      <PageHeader title="Wedding" description="Manage your wedding details and appearance" />

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-6">
          <WeddingDetailsForm
            weddingId={wedding.id}
            defaults={{
              title: wedding.title,
              subtitle: wedding.subtitle ?? "",
              partner1Name: wedding.partner1Name ?? "",
              partner2Name: wedding.partner2Name ?? "",
              date: dateInput(wedding.date),
              ceremonyTime: dateTimeInput(wedding.ceremonyTime),
              receptionTime: dateTimeInput(wedding.receptionTime),
              venueName: wedding.venueName ?? "",
              venueAddress: wedding.venueAddress ?? "",
              currency: wedding.currency,
              timezone: wedding.timezone,
              rsvpDeadline: dateInput(wedding.rsvpDeadline),
            }}
          />
        </TabsContent>
        <TabsContent value="appearance" className="mt-6">
          <AppearanceForm
            weddingId={wedding.id}
            defaults={{
              dressCode: settings?.dressCode ?? "",
              story: settings?.story ?? "",
              contactEmail: settings?.contactEmail ?? "",
              contactPhone: settings?.contactPhone ?? "",
              themeKey: settings?.themeKey ?? "classic",
              primaryColor: settings?.primaryColor ?? "#b03a5b",
              secondaryColor: settings?.secondaryColor ?? "#f4e6ea",
              fontHeading: settings?.fontHeading ?? "Playfair Display",
              fontBody: settings?.fontBody ?? "Inter",
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
