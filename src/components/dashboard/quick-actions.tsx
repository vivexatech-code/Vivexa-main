"use client";

import Link from "next/link";
import {
  Briefcase,
  Building2,
  FolderKanban,
  Globe,
  Inbox,
  UserPlus,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  {
    href: "/employees/new",
    title: "Add Employee",
    description: "Create a new employee or intern profile",
    icon: UserPlus,
  },
  {
    href: "/employees",
    title: "Manage Employees",
    description: "Search, edit, or download ID cards",
    icon: Users,
  },
  {
    href: "/projects/new",
    title: "Add Project",
    description: "Publish work to the public website",
    icon: FolderKanban,
  },
  {
    href: "/services/new",
    title: "Add Service",
    description: "Update the services shown on the site",
    icon: Briefcase,
  },
  {
    href: "/countries",
    title: "Multi-Country Experiences",
    description: "Manage UK, US, CA, AU & India content, currencies, and SEO",
    icon: Globe,
  },
  {
    href: "/logos",
    title: "Client Logos",
    description: "Manage 'Who We Work With' client logos marquee",
    icon: Building2,
  },
  {
    href: "/careers/new",
    title: "Add opportunity",
    description: "Publish a job or internship",
    icon: Briefcase,
  },
  {
    href: "/applications",
    title: "Review applications",
    description: "See candidates from the careers page",
    icon: Inbox,
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.06 }}
            >
              <Link
                href={action.href}
                className="group flex items-start gap-3 rounded-xl border border-border/80 bg-muted/40 p-4 transition-all hover:border-primary/20 hover:bg-accent/60 hover:shadow-soft"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card text-primary shadow-soft transition-transform group-hover:scale-105">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{action.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
