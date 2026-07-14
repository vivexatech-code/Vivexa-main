"use client";

import { useCallback, useEffect, useState } from "react";
import {
  computeDashboardStats,
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee,
} from "@/lib/firebase/employees";
import type {
  DashboardStats,
  Employee,
  EmployeeFormData,
} from "@/types/employee";

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addEmployee = useCallback(
    async (data: EmployeeFormData) => {
      const created = await createEmployee(data);
      setEmployees((prev) => [created, ...prev]);
      return created;
    },
    []
  );

  const editEmployee = useCallback(
    async (employeeId: string, data: EmployeeFormData) => {
      await updateEmployee(employeeId, data);
      setEmployees((prev) =>
        prev.map((employee) =>
          employee.employeeId === employeeId
            ? {
                ...employee,
                ...data,
                updatedAt: new Date().toISOString(),
              }
            : employee
        )
      );
    },
    []
  );

  const removeEmployee = useCallback(async (employeeId: string) => {
    await deleteEmployee(employeeId);
    setEmployees((prev) =>
      prev.filter((employee) => employee.employeeId !== employeeId)
    );
  }, []);

  const patchEmployee = useCallback((updated: Employee) => {
    setEmployees((prev) =>
      prev.map((employee) =>
        employee.employeeId === updated.employeeId ? updated : employee
      )
    );
  }, []);

  const stats: DashboardStats = computeDashboardStats(employees);

  return {
    employees,
    stats,
    loading,
    error,
    refresh,
    addEmployee,
    editEmployee,
    removeEmployee,
    patchEmployee,
  };
}
