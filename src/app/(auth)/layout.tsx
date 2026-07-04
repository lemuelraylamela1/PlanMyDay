import Link from "next/link";
import { CalendarHeart } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-accent/40 via-background to-background">
      <header className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <CalendarHeart className="h-5 w-5 text-primary" />
          PlanMyDay
        </Link>
        <ThemeToggle />
      </header>
      <main className="container flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
