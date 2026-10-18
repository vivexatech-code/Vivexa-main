"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Edit,
  MoreHorizontal,
  PowerOff,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { updateDepartment, deleteDepartment } from "@/lib/firebase/departments";
import type { Department, DepartmentStatus } from "@/types/department";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { useAuth } from "@/contexts/auth-context";

interface DepartmentTableProps {
  departments: Department[];
  onRefresh: () => Promise<void>;
}

export function DepartmentTable({ departments, onRefresh }: DepartmentTableProps) {
  const router = useRouter();
  const { isSuperAdmin } = useAuth();
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusToggle = async (dept: Department) => {
    const nextStatus: DepartmentStatus = dept.status === "active" ? "inactive" : "active";
    try {
      await updateDepartment(dept.id, { status: nextStatus });
      toast.success(`Department ${dept.name} is now ${nextStatus}`);
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change department status");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteDepartment(deleteTarget.id);
      toast.success(`Department ${deleteTarget.name} deleted`);
      setDeleteTarget(null);
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete department");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5">Assigned Members</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                    No departments found.
                  </td>
                </tr>
              ) : (
                departments.map((dept) => {
                  const activePermissionsCount = Object.values(dept.defaultPermissions || {}).filter(
                    (p) => p !== "none",
                  ).length;

                  return (
                    <tr key={dept.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">{dept.name}</span>
                              {dept.isSystem ? (
                                <Badge variant="outline" className="text-[10px] bg-muted/60">
                                  Default
                                </Badge>
                              ) : null}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {activePermissionsCount} permitted module(s)
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs text-muted-foreground max-w-xs truncate">
                        {dept.description || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{dept.memberCount || 0} user(s)</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {dept.status === "active" ? (
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/departments/${dept.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit & Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusToggle(dept)}>
                              {dept.status === "active" ? (
                                <>
                                  <PowerOff className="mr-2 h-4 w-4 text-amber-600" /> Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            {!dept.isSystem && isSuperAdmin ? (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setDeleteTarget(dept)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete Department
                                </DropdownMenuItem>
                              </>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget ? (
        <AlertDialog open onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Department</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{deleteTarget.name}</strong>? Users belonging to this department will lose their inherited permissions unless re-assigned.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Department"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </div>
  );
}
