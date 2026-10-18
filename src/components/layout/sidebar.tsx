"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  FileCheck,
  FolderKanban,
  Globe,
  History,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Plus,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getPendingApprovalsCount } from "@/lib/firebase/approvals";
import type { AppModule } from "@/types/auth";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  match?: string;
  module: AppModule;
  writeRequired?: boolean;
  showBadge?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/users", label: "Users & Access", icon: Users, match: "/users", module: "users" },
      { href: "/departments", label: "Departments", icon: Building2, match: "/departments", module: "departments" },
      { href: "/approvals", label: "Approvals", icon: FileCheck, match: "/approvals", module: "approvals", showBadge: true },
      { href: "/audit-logs", label: "Audit Trail", icon: History, match: "/audit-logs", module: "audit_logs" },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/employees", label: "Employees", icon: Users, match: "/employees", module: "employees" },
      { href: "/employees/new", label: "Add Employee", icon: Plus, module: "employees", writeRequired: true },
    ],
  },
  {
    label: "Website & Content",
    items: [
      { href: "/countries", label: "Countries", icon: Globe, match: "/countries", module: "countries" },
      { href: "/logos", label: "Client Logos", icon: Building2, match: "/logos", module: "logos" },
      { href: "/projects", label: "Projects", icon: FolderKanban, match: "/projects", module: "projects" },
      { href: "/services", label: "Services", icon: Briefcase, match: "/services", module: "services" },
    ],
  },
  {
    label: "Career Management",
    items: [
      { href: "/careers", label: "Opportunities", icon: Briefcase, match: "/careers", module: "careers" },
      { href: "/applications", label: "Applications", icon: Inbox, match: "/applications", module: "careers" },
    ],
  },
  {
    label: "Blog Management",
    items: [
      { href: "/blogs", label: "Articles", icon: Newspaper, match: "/blogs", module: "blogs" },
      { href: "/blogs/new", label: "Write Article", icon: Plus, module: "blogs", writeRequired: true },
    ],
  },
];

function isActive(pathname: string, href: string, match?: string) {
  if (href === "/dashboard") return pathname === href;
  if (href === "/employees/new" || href === "/blogs/new" || href === "/users/new" || href === "/departments/new") {
    return pathname === href;
  }
  if (match) {
    return pathname === match || pathname.startsWith(`${match}/`);
  }
  return pathname === href;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user, adminUser, isSuperAdmin, can } = useAuth();
  const [open, setOpen] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function loadCount() {
      try {
        const count = await getPendingApprovalsCount();
        if (mounted) setPendingApprovals(count);
      } catch {
        // Silently ignore if unauthenticated or offline
      }
    }
    loadCount();
    const interval = setInterval(loadCount, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully");
    router.replace("/login");
  };

  // Filter groups and items based on permissions
  const visibleGroups = navGroups
    .map((group) => {
      const permittedItems = group.items.filter((item) => {
        if (!can(item.module, "view")) return false;
        if (item.writeRequired && !can(item.module, "write")) return false;
        return true;
      });
      return { ...group, items: permittedItems };
    })
    .filter((group) => group.items.length > 0);

  const Nav = (
    <div className="flex h-full flex-col">
      <div className="px-6 pb-2 pt-7">
        <Link href="/dashboard" className="block" onClick={() => setOpen(false)}>
          <div className="flex items-center gap-2">
            <p className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Vivexa
            </p>
            {isSuperAdmin ? (
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                Super Admin
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Enterprise Control Center</p>
        </Link>
      </div>

      <nav className="mt-4 flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href, item.match);
                const Icon = item.icon;
                const showBadge = item.showBadge && pendingApprovals > 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all",
                      active
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "text-secondary-foreground hover:bg-muted",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {showBadge ? (
                      <span
                        className={cn(
                          "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
                          active
                            ? "bg-primary-foreground text-primary"
                            : "bg-primary text-primary-foreground",
                        )}
                      >
                        {pendingApprovals}
                      </span>
                    ) : null}
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
          <p className="truncate text-sm font-semibold text-foreground">
            {adminUser?.displayName || user?.displayName || "Admin User"}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {adminUser?.email || user?.email}
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
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
