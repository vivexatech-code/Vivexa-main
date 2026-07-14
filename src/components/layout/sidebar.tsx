"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/employees/new", label: "Add Employee", icon: UserPlus },
];

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
          <p className="mt-1 text-xs text-muted-foreground">Employee Management</p>
        </Link>
      </div>

      <nav className="mt-6 flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/employees/new" &&
              pathname.startsWith(item.href));
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
                  : "text-secondary-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
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
