import Link from "next/link";
import {
  ArrowUpRight,
  CalendarHeart,
  Check,
  CheckCircle2,
  Clock3,
  LayoutGrid,
  Mail,
  MapPin,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const chapters = [
  {
    number: "01",
    icon: Users,
    title: "Know every guest",
    description:
      "Invitations, meal choices, plus-ones and replies stay attached to the right person.",
    note: "Guest list",
    stat: "86 yeses",
  },
  {
    number: "02",
    icon: LayoutGrid,
    title: "Shape the room",
    description: "Move accepted guests from unassigned to seated without losing sight of capacity.",
    note: "Seating",
    stat: "12 tables",
  },
  {
    number: "03",
    icon: WalletCards,
    title: "Mind the numbers",
    description: "See commitments, payments and what remains before the celebration begins.",
    note: "Budget",
    stat: "68% paid",
  },
  {
    number: "04",
    icon: Clock3,
    title: "Compose the day",
    description: "Turn a list of moments into one clear, shareable wedding-day rhythm.",
    note: "Timeline",
    stat: "9 moments",
  },
];

const previewNavigation = [
  { icon: LayoutGrid, label: "Overview" },
  { icon: Users, label: "Guests" },
  { icon: WalletCards, label: "Budget" },
  { icon: Clock3, label: "Timeline" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="relative z-30 border-b bg-background/90 backdrop-blur-xl">
        <div className="container flex h-16 max-w-7xl items-center justify-between">
          <Link href="/" className="group flex items-center gap-2 font-semibold" aria-label="PlanMyDay home">
            <CalendarHeart className="h-5 w-5 text-primary transition-transform duration-300 group-hover:-rotate-12" />
            <span>PlanMyDay</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button variant="ghost" className="hidden sm:inline-flex" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">
                Start planning
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative border-b">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.35] dark:opacity-[0.16]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
              backgroundSize: "36px 36px",
              maskImage: "linear-gradient(to bottom, black, transparent 88%)",
            }}
          />
          <div aria-hidden className="absolute left-[8%] top-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

          <div className="container relative grid max-w-7xl gap-12 py-10 sm:py-14 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(0,0.9fr)_minmax(460px,1.1fr)] lg:items-center lg:gap-16 lg:py-10">
            <div className="relative z-10">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>One calm place for the whole celebration</span>
              </div>

              <h1 className="max-w-2xl text-[clamp(3.25rem,7vw,6.6rem)] font-bold leading-[0.91] tracking-[-0.065em]">
                Make room
                <span className="relative block w-fit text-primary">
                  for the day.
                  <svg
                    aria-hidden
                    viewBox="0 0 420 18"
                    className="absolute -bottom-3 left-0 h-3 w-full text-primary/30"
                    preserveAspectRatio="none"
                  >
                    <path d="M2 13C118 2 281 3 418 8" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              <p className="mt-9 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Every guest, peso, seat and promise in view—so planning feels less like project
                management and more like making something meaningful.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button size="lg" className="h-12 px-6" asChild>
                  <Link href="/register">
                    Open your planning room
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-6" asChild>
                  <Link href="/login">Explore the demo</Link>
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                {["Free to explore", "No card required", "Built for two"].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative min-h-[min(70svh,560px)] lg:min-h-[calc(100svh-8rem)]">
              <div className="absolute inset-4 rounded-[2rem] border bg-muted/35 sm:inset-8" />
              <div className="absolute inset-x-0 top-12 mx-auto w-[92%] overflow-hidden rounded-xl border bg-card shadow-2xl shadow-primary/10 sm:w-[86%]">
                <div className="flex h-11 items-center justify-between border-b bg-muted/30 px-4">
                  <div className="flex items-center gap-2">
                    <CalendarHeart className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold">Alex & Jordan</span>
                  </div>
                  <span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
                    118 days to go
                  </span>
                </div>
                <div className="grid grid-cols-[108px_1fr] sm:grid-cols-[132px_1fr]">
                  <div className="border-r p-3">
                    <p className="px-2 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Planning
                    </p>
                    <div className="mt-2 space-y-1">
                      {previewNavigation.map((item, index) => (
                        <div
                          key={item.label}
                          className={`flex items-center gap-2 rounded-md px-2 py-2 text-[10px] font-medium ${
                            index === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground"
                          }`}
                        >
                          <item.icon className="h-3.5 w-3.5" />
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Good morning</p>
                        <p className="mt-0.5 text-sm font-semibold sm:text-base">Your day at a glance</p>
                      </div>
                      <div className="hidden h-7 w-16 rounded-md bg-primary sm:block" />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        ["86", "Guests"],
                        ["5/12", "Tasks"],
                        ["68%", "Budget"],
                      ].map(([value, label]) => (
                        <div key={label} className="rounded-lg border bg-background p-2.5 shadow-sm">
                          <p className="text-sm font-bold sm:text-lg">{value}</p>
                          <p className="mt-0.5 text-[9px] text-muted-foreground">{label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-lg border bg-background p-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold">Planning progress</p>
                        <p className="text-[9px] text-primary">62%</p>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full w-[62%] rounded-full bg-primary" />
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-1">
                        {[72, 45, 88].map((height, index) => (
                          <div key={height} className="flex h-14 items-end rounded bg-muted/70 px-1.5">
                            <div
                              className={`w-full rounded-t ${index === 2 ? "bg-primary" : "bg-primary/35"}`}
                              style={{ height: `${height}%` }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 left-0 w-[58%] -rotate-2 rounded-xl border bg-card p-4 shadow-xl sm:bottom-6 sm:left-2 sm:w-[52%] sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Today&apos;s focus</span>
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {["Confirm photographer", "Review guest replies", "Taste the cake"].map((task, index) => (
                    <div key={task} className="flex items-center gap-2 text-[10px] sm:text-xs">
                      <span
                        className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${
                          index < 2 ? "border-primary bg-primary text-primary-foreground" : ""
                        }`}
                      >
                        {index < 2 && <Check className="h-2.5 w-2.5" />}
                      </span>
                      <span className={index < 2 ? "text-muted-foreground line-through" : "font-medium"}>
                        {task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-20 right-0 w-[45%] rotate-2 rounded-xl border border-primary/20 bg-primary p-4 text-primary-foreground shadow-xl sm:bottom-12 sm:right-1 sm:w-[42%] sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-primary-foreground/70">
                    Guest pulse
                  </span>
                  <Users className="h-3.5 w-3.5" />
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight">86</p>
                <p className="text-[10px] text-primary-foreground/70">joyful yeses received</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b bg-muted/30">
          <div className="container max-w-7xl py-20 sm:py-28">
            <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
              <div className="lg:sticky lg:top-24 lg:self-start">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  One room · four views
                </p>
                <h2 className="mt-5 max-w-md text-4xl font-bold leading-[0.98] tracking-[-0.045em] sm:text-6xl">
                  The plan,
                  <span className="block text-muted-foreground">without the noise.</span>
                </h2>
                <p className="mt-6 max-w-sm text-sm leading-6 text-muted-foreground">
                  Each part is simple on its own. Together, they tell you exactly where the wedding
                  stands.
                </p>
                <div className="mt-8 hidden items-center gap-3 text-xs text-muted-foreground lg:flex">
                  <span className="h-px w-10 bg-primary" />
                  Scroll through your planning room
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {chapters.map((chapter, index) => (
                  <article
                    key={chapter.number}
                    className={`group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg ${
                      index === 1 || index === 2 ? "sm:translate-y-10" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">{chapter.number}</span>
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:rotate-6">
                        <chapter.icon className="h-[18px] w-[18px]" />
                      </span>
                    </div>
                    <p className="mt-10 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                      {chapter.note}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight">{chapter.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{chapter.description}</p>
                    <div className="mt-8 flex items-end justify-between border-t pt-4">
                      <span className="text-xs text-muted-foreground">Live overview</span>
                      <span className="text-lg font-bold tracking-tight">{chapter.stat}</span>
                    </div>
                    <div className="absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-primary/5 transition-transform group-hover:scale-125" />
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative">
          <div className="container max-w-7xl py-20 sm:py-28">
            <div className="relative overflow-hidden rounded-[1.5rem] border bg-card shadow-sm">
              <div
                aria-hidden
                className="absolute inset-0 opacity-50"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)",
                  backgroundSize: "22px 22px",
                  maskImage: "linear-gradient(90deg, black, transparent 75%)",
                }}
              />
              <div className="relative grid gap-10 p-7 sm:p-12 lg:grid-cols-[1fr_0.55fr] lg:items-end lg:p-16">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    <Mail className="h-4 w-4" />
                    From plan to invitation
                  </div>
                  <h2 className="mt-6 max-w-3xl text-[clamp(2.7rem,6vw,5.8rem)] font-bold leading-[0.92] tracking-[-0.06em]">
                    Give every detail
                    <span className="block text-primary">a place to land.</span>
                  </h2>
                </div>

                <div className="rounded-xl border bg-background/90 p-5 shadow-sm backdrop-blur">
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">The Glasshouse Gardens</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Ceremony at 3:00 PM · Garden formal
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 border-t pt-5 text-sm leading-6 text-muted-foreground">
                    Send a private RSVP link, welcome each guest by name, and watch every answer
                    return to your plan.
                  </p>
                  <Button className="mt-5 w-full" asChild>
                    <Link href="/register">
                      Start with your guest list
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/20">
        <div className="container flex max-w-7xl flex-col gap-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <CalendarHeart className="h-4 w-4 text-primary" />
            PlanMyDay
          </Link>
          <p>Made for the life around the list.</p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="transition-colors hover:text-primary">
              Sign in
            </Link>
            <Link href="/register" className="font-medium text-foreground transition-colors hover:text-primary">
              Create a planning room
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
