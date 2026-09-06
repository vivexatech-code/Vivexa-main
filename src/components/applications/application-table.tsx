"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Inbox, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { applicationStatusLabel } from "@/lib/firebase/applications";
import type { CareerApplication } from "@/types/career";

type ApplicationTableProps = {
  applications: CareerApplication[];
};

export function ApplicationTable({ applications }: ApplicationTableProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = Date.now();
    return applications.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.opportunityTitle.toLowerCase().includes(q);
      const matchesType =
        typeFilter === "all" || item.opportunityType === typeFilter;
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const created = new Date(item.createdAt).getTime();
      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "7" && now - created <= 7 * 86400000) ||
        (dateFilter === "30" && now - created <= 30 * 86400000);
      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [applications, search, typeFilter, statusFilter, dateFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicants or roles…"
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full lg:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="Job">Jobs</SelectItem>
            <SelectItem value="Internship">Internships</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="review">Under Review</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="selected">Selected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full lg:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any date</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={applications.length === 0 ? "No applications yet" : "No matches"}
          description={
            applications.length === 0
              ? "Applications submitted from the website will appear here."
              : "Try adjusting your search or filters."
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr className="text-muted-foreground">
                    <th className="px-4 py-3.5 font-medium">Applicant</th>
                    <th className="px-4 py-3.5 font-medium">Opportunity</th>
                    <th className="px-4 py-3.5 font-medium">Status</th>
                    <th className="px-4 py-3.5 font-medium">Date</th>
                    <th className="px-4 py-3.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-border/70 last:border-0 hover:bg-muted/40"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.email}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p>{item.opportunityTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.opportunityType}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            item.status === "selected"
                              ? "success"
                              : item.status === "rejected"
                                ? "warning"
                                : "secondary"
                          }
                        >
                          {applicationStatusLabel(item.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.createdAt.slice(0, 10)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/applications/${item.id}`}>View</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
