import Link from "next/link";
import { CalendarHeart } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center">
      <CalendarHeart className="h-12 w-12 text-primary" />
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">We couldn&apos;t find the page you were looking for.</p>
      <Button asChild>
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
