"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  IdCard,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { IdCardDialog } from "@/components/id-card/id-card-dialog";
import type { Employee } from "@/types/employee";

type EmployeeTableProps = {
  employees: Employee[];
  onDelete: (employeeId: string) => Promise<void>;
  onEmployeeUpdated?: (employee: Employee) => void;
};

export function EmployeeTable({
  employees,
  onDelete,
  onEmployeeUpdated,
}: EmployeeTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [idCardTarget, setIdCardTarget] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter((employee) => {
      const matchesSearch =
        !q ||
        employee.name.toLowerCase().includes(q) ||
        employee.employeeId.toLowerCase().includes(q) ||
        employee.designation.toLowerCase().includes(q) ||
        employee.phone.toLowerCase().includes(q);

      const matchesType =
        typeFilter === "all" || employee.employeeType === typeFilter;
      const matchesStatus =
        statusFilter === "all" || employee.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [employees, search, typeFilter, statusFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDelete(deleteTarget.employeeId);
      toast.success(`${deleteTarget.name} deleted`);
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
            placeholder="Search by name, ID, designation…"
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="Employee">Employee</SelectItem>
            <SelectItem value="Intern">Intern</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={employees.length === 0 ? "No employees yet" : "No matches"}
          description={
            employees.length === 0
              ? "Add your first employee to start managing your team."
              : "Try adjusting your search or filters."
          }
          actionLabel={employees.length === 0 ? "Add Employee" : undefined}
          onAction={
            employees.length === 0
              ? () => router.push("/employees/new")
              : undefined
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr className="text-muted-foreground">
                    <th className="px-4 py-3.5 font-medium">Photo</th>
                    <th className="px-4 py-3.5 font-medium">Employee ID</th>
                    <th className="px-4 py-3.5 font-medium">Name</th>
                    <th className="px-4 py-3.5 font-medium">Designation</th>
                    <th className="px-4 py-3.5 font-medium">Type</th>
                    <th className="px-4 py-3.5 font-medium">Status</th>
                    <th className="px-4 py-3.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((employee) => (
                    <tr
                      key={employee.employeeId}
                      className="border-b border-border/70 transition-colors last:border-0 hover:bg-muted/40"
                    >
                      <td className="px-4 py-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={employee.profilePhoto}
                            alt={employee.name}
                          />
                          <AvatarFallback>
                            {employee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {employee.employeeId}
                      </td>
                      <td className="px-4 py-3">{employee.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {employee.designation}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            employee.employeeType === "Intern"
                              ? "muted"
                              : "secondary"
                          }
                        >
                          {employee.employeeType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            employee.status === "Active" ? "success" : "warning"
                          }
                        >
                          {employee.status}
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
                              <Link href={`/employees/${employee.employeeId}`}>
                                <Eye className="h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/employees/${employee.employeeId}/edit`}
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setIdCardTarget(employee)}
                            >
                              <IdCard className="h-4 w-4" />
                              Download ID Card
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteTarget(employee)}
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
            <AlertDialogTitle>Delete employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>{" "}
              ({deleteTarget?.employeeId}) from Vivexa. This action cannot be
              undone.
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

      <IdCardDialog
        employee={idCardTarget}
        open={!!idCardTarget}
        onOpenChange={(open) => !open && setIdCardTarget(null)}
        onEmployeeUpdated={(updated) => {
          setIdCardTarget(updated);
          onEmployeeUpdated?.(updated);
        }}
      />
    </div>
  );
}
