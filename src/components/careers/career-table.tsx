"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import type { CareerOpportunity, CareerStatus } from "@/types/career";

type CareerTableProps = {
  careers: CareerOpportunity[];
  onDelete: (id: string) => Promise<void>;
  onStatusChange: (id: string, status: CareerStatus) => Promise<void>;
};

export function CareerTable({
  careers,
  onDelete,
  onStatusChange,
}: CareerTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<CareerOpportunity | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return careers.filter((item) => {
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q);
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [careers, search, typeFilter, statusFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDelete(deleteTarget.id);
      toast.success(`${deleteTarget.title} deleted`);
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles…"
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
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={careers.length === 0 ? "No opportunities yet" : "No matches"}
          description={
            careers.length === 0
              ? "Publish a job or internship to show it on the website careers page."
              : "Try adjusting your search or filters."
          }
          actionLabel={careers.length === 0 ? "Add opportunity" : undefined}
          onAction={
            careers.length === 0 ? () => router.push("/careers/new") : undefined
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr className="text-muted-foreground">
                    <th className="px-4 py-3.5 font-medium">Role</th>
                    <th className="px-4 py-3.5 font-medium">Type</th>
                    <th className="px-4 py-3.5 font-medium">Location</th>
                    <th className="px-4 py-3.5 font-medium">Status</th>
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
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.department}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{item.type}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.location} · {item.workType}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            item.status === "published"
                              ? "success"
                              : item.status === "closed"
                                ? "warning"
                                : "muted"
                          }
                        >
                          {item.status === "published"
                            ? "Published"
                            : item.status === "closed"
                              ? "Closed"
                              : "Draft"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/careers/${item.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                                View / Edit
                              </Link>
                            </DropdownMenuItem>
                            {item.status !== "published" ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  void onStatusChange(item.id, "published")
                                    .then(() => toast.success("Published"))
                                    .catch((err) =>
                                      toast.error(
                                        err instanceof Error
                                          ? err.message
                                          : "Publish failed",
                                      ),
                                    )
                                }
                              >
                                Publish
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  void onStatusChange(item.id, "draft")
                                    .then(() => toast.success("Unpublished"))
                                    .catch((err) =>
                                      toast.error(
                                        err instanceof Error
                                          ? err.message
                                          : "Unpublish failed",
                                      ),
                                    )
                                }
                              >
                                Unpublish
                              </DropdownMenuItem>
                            )}
                            {item.status !== "closed" ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  void onStatusChange(item.id, "closed")
                                    .then(() => toast.success("Marked closed"))
                                    .catch((err) =>
                                      toast.error(
                                        err instanceof Error
                                          ? err.message
                                          : "Close failed",
                                      ),
                                    )
                                }
                              >
                                Close applications
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteTarget(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete opportunity?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.title}
              </span>{" "}
              from the careers page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-[#b91c1c]"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
