"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteApplication,
  getApplications,
  updateApplicationStatus,
} from "@/lib/firebase/applications";
import type { ApplicationStatus, CareerApplication } from "@/types/career";

export function useApplications() {
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setApplications(await getApplications());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load applications",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setStatus = useCallback(
    async (id: string, status: ApplicationStatus) => {
      await updateApplicationStatus(id, status);
      setApplications((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status, updatedAt: new Date().toISOString() }
            : item,
        ),
      );
    },
    [],
  );

  const removeApplication = useCallback(async (id: string) => {
    await deleteApplication(id);
    setApplications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    applications,
    loading,
    error,
    refresh,
    setStatus,
    removeApplication,
  };
}
