import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarHeart } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { getActiveWeddingForUser, requireVerifiedUser } from "@/lib/authz";
import { CreateWeddingForm } from "@/features/weddings/components/create-wedding-form";

export const metadata: Metadata = { title: "Create your wedding" };

export default async function OnboardingPage() {
  const user = await requireVerifiedUser();
  const existing = await getActiveWeddingForUser(user.id);
  if (existing) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-accent/40 via-background to-background">
      <header className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <CalendarHeart className="h-5 w-5 text-primary" />
          PlanMyDay
        </Link>
        <ThemeToggle />
      </header>
      <main className="container flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Let&apos;s plan your wedding</CardTitle>
              <CardDescription>
                Create your wedding workspace. You can change any of this later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateWeddingForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
