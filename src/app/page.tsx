import Link from "next/link";
import {
  CalendarHeart,
  Users,
  Wallet,
  LayoutGrid,
  Mail,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  { icon: Users, title: "Guest Management", desc: "Track invitations, RSVPs, meals and plus-ones." },
  { icon: LayoutGrid, title: "Seating Planner", desc: "Arrange tables and seats with ease." },
  { icon: Wallet, title: "Budget Tracker", desc: "Plan spending and monitor every payment." },
  { icon: CalendarHeart, title: "Timeline", desc: "Build your wedding-day schedule minute by minute." },
  { icon: Mail, title: "Invitations & RSVP", desc: "Send personalized, secure invitation links." },
  { icon: Sparkles, title: "Wedding Website", desc: "Configure a beautiful public site for your guests." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/30">
      <header className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <CalendarHeart className="h-5 w-5 text-primary" />
          PlanMyDay
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </header>

      <main className="container">
        <section className="flex flex-col items-center py-20 text-center md:py-32">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Everything you need to plan the perfect day
          </span>
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-6xl">
            Your wedding, beautifully organized in one place
          </h1>
          <p className="mt-6 max-w-xl text-balance text-lg text-muted-foreground">
            Manage guests, seating, budget, suppliers, timeline and invitations. Then publish a
            stunning wedding website for your guests.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/register">
                Start planning free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">I already have an account</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-3 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} PlanMyDay. Crafted for couples.
        </div>
      </footer>
    </div>
  );
}
