"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createService,
  deleteService,
  getServices,
  updateService,
} from "@/lib/firebase/services";
import type { Service, ServiceFormData } from "@/types/service";

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setServices(await getServices());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addService = useCallback(async (data: ServiceFormData) => {
    const created = await createService(data);
    setServices((prev) =>
      [...prev, created].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
      ),
    );
    return created;
  }, []);

  const editService = useCallback(async (id: string, data: ServiceFormData) => {
    await updateService(id, data);
    setServices((prev) =>
      prev
        .map((service) =>
          service.id === id
            ? { ...service, ...data, updatedAt: new Date().toISOString() }
            : service,
        )
        .sort(
          (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
        ),
    );
  }, []);

  const removeService = useCallback(async (id: string) => {
    await deleteService(id);
    setServices((prev) => prev.filter((service) => service.id !== id));
  }, []);

  return {
    services,
    loading,
    error,
    refresh,
    addService,
    editService,
    removeService,
  };
}
