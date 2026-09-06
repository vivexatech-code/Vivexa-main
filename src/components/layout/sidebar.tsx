"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Briefcase,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Plus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const navGroups = [
  {
    label: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "People",
    items: [
      { href: "/employees", label: "Employees", icon: Users, match: "/employees" },
      { href: "/employees/new", label: "Add Employee", icon: Plus },
    ],
  },
  {
    label: "Website",
    items: [
      { href: "/projects", label: "Projects", icon: FolderKanban, match: "/projects" },
      { href: "/services", label: "Services", icon: Briefcase, match: "/services" },
    ],
  },
  {
    label: "Career Management",
    items: [
      { href: "/careers", label: "Opportunities", icon: Briefcase, match: "/careers" },
      { href: "/applications", label: "Applications", icon: Inbox, match: "/applications" },
    ],
  },
  {
    label: "Blog Management",
    items: [
      { href: "/blogs", label: "Articles", icon: Newspaper, match: "/blogs" },
      { href: "/blogs/new", label: "Write Article", icon: Plus },
    ],
  },
];

function isActive(pathname: string, href: string, match?: string) {
  if (href === "/dashboard") return pathname === href;
  if (href === "/employees/new" || href === "/blogs/new") return pathname === href;
  if (match) {
    return pathname === match || pathname.startsWith(`${match}/`);
  }
  return pathname === href;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully");
    router.replace("/login");
  };

  const Nav = (
    <div className="flex h-full flex-col">
      <div className="px-6 pb-2 pt-7">
        <Link href="/dashboard" className="block" onClick={() => setOpen(false)}>
          <p className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Vivexa
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Admin Panel</p>
        </Link>
      </div>

      <nav className="mt-4 flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href, item.match);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "text-secondary-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-3 rounded-xl bg-muted/70 px-3 py-2.5">
          <p className="truncate text-xs text-muted-foreground">Signed in as</p>
          <p className="truncate text-sm font-medium">{user?.email}</p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-card/90 backdrop-blur-xl lg:block">
        {Nav}
      </aside>

      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <p className="font-display text-lg font-semibold">Vivexa</p>
        <Button variant="ghost" size="icon" onClick={() => setOpen((v) => !v)}>
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="h-full w-72 bg-card shadow-lift"
            onClick={(e) => e.stopPropagation()}
          >
            {Nav}
          </motion.aside>
        </motion.div>
      ) : null}
    </>
  );
}
