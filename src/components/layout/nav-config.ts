import {
  LayoutDashboard,
  Heart,
  Users,
  Armchair,
  Store,
  Wallet,
  ListChecks,
  Clock,
  MailOpen,
  Globe,
  Image,
  Bell,
  ScrollText,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Planning",
    items: [
      { label: "Wedding", href: "/wedding", icon: Heart },
      { label: "Guests", href: "/guests", icon: Users },
      { label: "Seating", href: "/seating", icon: Armchair },
      { label: "Suppliers", href: "/suppliers", icon: Store },
      { label: "Budget", href: "/budget", icon: Wallet },
      { label: "Tasks", href: "/tasks", icon: ListChecks },
      { label: "Timeline", href: "/timeline", icon: Clock },
    ],
  },
  {
    label: "Guests & Web",
    items: [
      { label: "Invitations & RSVP", href: "/invitations", icon: MailOpen },
      { label: "Website", href: "/website", icon: Globe },
      { label: "Media Library", href: "/media", icon: Image },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Activity", href: "/activity", icon: ScrollText },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export const adminNav: NavItem[] = [
  { label: "Admin Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Weddings", href: "/admin/weddings", icon: Heart },
];
