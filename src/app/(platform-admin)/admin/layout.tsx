import Link from "next/link";
import { Shield } from "lucide-react";

import { requireAdmin } from "@/lib/authz";
import { adminNav } from "@/components/layout/nav-config";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur lg:px-6">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <Shield className="h-5 w-5 text-primary" /> PlanMyDay Admin
        </Link>
        <nav className="hidden gap-1 md:flex">
          {adminNav.map((item) => (
            <Button key={item.href} variant="ghost" size="sm" asChild>
              <Link href={item.href}>
                <item.icon className="h-4 w-4" /> {item.label}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">Exit admin</Link>
          </Button>
          <ThemeToggle />
          <UserMenu name={user.name ?? user.email ?? "Admin"} email={user.email ?? ""} isAdmin />
        </div>
      </header>
      <main className="container max-w-7xl py-6">{children}</main>
    </div>
  );
}
