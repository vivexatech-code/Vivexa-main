"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createCareer,
  deleteCareer,
  getCareers,
  updateCareer,
  updateCareerStatus,
} from "@/lib/firebase/careers";
import type {
  CareerFormData,
  CareerOpportunity,
  CareerStatus,
} from "@/types/career";

export function useCareers() {
  const [careers, setCareers] = useState<CareerOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCareers(await getCareers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load careers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addCareer = useCallback(async (data: CareerFormData) => {
    const created = await createCareer(data);
    setCareers((prev) => [created, ...prev]);
    return created;
  }, []);

  const editCareer = useCallback(async (id: string, data: CareerFormData) => {
    await updateCareer(id, data);
    setCareers((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...data, updatedAt: new Date().toISOString() }
          : item,
      ),
    );
  }, []);

  const setCareerStatus = useCallback(
    async (id: string, status: CareerStatus) => {
      await updateCareerStatus(id, status);
      setCareers((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status, updatedAt: new Date().toISOString() }
            : item,
        ),
      );
    },
    [],
  );

  const removeCareer = useCallback(async (id: string) => {
    await deleteCareer(id);
    setCareers((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    careers,
    loading,
    error,
    refresh,
    addCareer,
    editCareer,
    setCareerStatus,
    removeCareer,
  };
}
