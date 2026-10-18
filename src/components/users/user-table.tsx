"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";
import { deleteAdminUser, updateUserStatus } from "@/lib/firebase/admin-users";
import type { AdminUser, UserStatus } from "@/types/auth";
import type { Department } from "@/types/department";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  Edit,
  Eye,
  KeyRound,
  MoreHorizontal,
  Search,
  Shield,
  Trash2,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

interface UserTableProps {
  users: AdminUser[];
  departments: Department[];
  onRefresh: () => Promise<void>;
}

export function UserTable({ users, departments, onRefresh }: UserTableProps) {
  const router = useRouter();
  const { adminUser: currentUser, isSuperAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const deptMap = new Map(departments.map((d) => [d.id, d.name]));

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.jobTitle && u.jobTitle.toLowerCase().includes(search.toLowerCase()));

    const matchesDept =
      departmentFilter === "all" || u.departments.includes(departmentFilter);

    const matchesStatus =
      statusFilter === "all" || u.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    try {
      await updateUserStatus(userId, newStatus, {
        id: currentUser?.id || "unknown",
        name: currentUser?.displayName || "Admin",
        email: currentUser?.email || "admin@vivexatech.in",
      });
      toast.success(`User status updated to ${newStatus}`);
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handlePasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(getClientAuth(), email);
      toast.success(`Password reset email sent to ${email}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset email");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteAdminUser(deleteTarget.id, {
        id: currentUser?.id || "unknown",
        name: currentUser?.displayName || "Admin",
        email: currentUser?.email || "admin@vivexatech.in",
      });
      toast.success(`User ${deleteTarget.displayName} deleted`);
      setDeleteTarget(null);
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const statusBadge = (status: UserStatus) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "suspended":
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">Suspended</Badge>;
      case "revoked":
        return <Badge variant="destructive">Revoked</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Departments</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 hidden md:table-cell">Role Type</th>
                <th className="px-5 py-3.5 hidden lg:table-cell">Last Login</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const userDepts = u.departments.map((id) => deptMap.get(id) || id);

                  return (
                    <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {u.displayName}
                            </span>
                            {u.isSuperAdmin ? (
                              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                                <Shield className="h-3 w-3 mr-1" />
                                Super Admin
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                          {u.jobTitle ? (
                            <p className="text-xs font-medium text-muted-foreground mt-0.5">
                              {u.jobTitle}
                            </p>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {userDepts.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {userDepts.map((name) => (
                              <Badge key={name} variant="outline" className="text-xs bg-muted/50">
                                {name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">No department</span>
                        )}
                      </td>

                      <td className="px-5 py-4">{statusBadge(u.status)}</td>

                      <td className="px-5 py-4 hidden md:table-cell">
                        {u.isSuperAdmin ? (
                          <span className="text-xs font-semibold text-primary">Unrestricted</span>
                        ) : Object.keys(u.permissions || {}).length > 0 ? (
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Custom Overrides</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Department Default</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-xs text-muted-foreground hidden lg:table-cell">
                        {u.lastLoginAt
                          ? new Date(u.lastLoginAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Never"}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>User Options</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/users/${u.id}`)}>
                              <Eye className="mr-2 h-4 w-4" /> View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/users/${u.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePasswordReset(u.email)}>
                              <KeyRound className="mr-2 h-4 w-4" /> Send Reset Link
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Status</DropdownMenuLabel>
                            {u.status !== "active" ? (
                              <DropdownMenuItem onClick={() => handleStatusChange(u.id, "active")}>
                                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> Activate Account
                              </DropdownMenuItem>
                            ) : null}
                            {u.status !== "suspended" ? (
                              <DropdownMenuItem onClick={() => handleStatusChange(u.id, "suspended")}>
                                <UserX className="mr-2 h-4 w-4 text-amber-600" /> Suspend Access
                              </DropdownMenuItem>
                            ) : null}
                            {u.status !== "inactive" ? (
                              <DropdownMenuItem onClick={() => handleStatusChange(u.id, "inactive")}>
                                <UserX className="mr-2 h-4 w-4 text-slate-600" /> Mark Inactive
                              </DropdownMenuItem>
                            ) : null}
                            {u.status !== "revoked" ? (
                              <DropdownMenuItem onClick={() => handleStatusChange(u.id, "revoked")}>
                                <UserX className="mr-2 h-4 w-4 text-destructive" /> Revoke Access
                              </DropdownMenuItem>
                            ) : null}
                            {!u.isSuperAdmin && isSuperAdmin ? (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setDeleteTarget(u)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete User
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

      {/* Delete Confirmation Modal */}
      {deleteTarget ? (
        <AlertDialog open onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User Account</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete <strong>{deleteTarget.displayName}</strong> ({deleteTarget.email})? This action cannot be undone and will revoke all access immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete User"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </div>
  );
}
