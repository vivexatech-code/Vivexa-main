"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createClientLogo,
  deleteClientLogo,
  getClientLogos,
  updateClientLogo,
} from "@/lib/firebase/client-logos";
import type { ClientLogo, ClientLogoFormData } from "@/types/client-logo";

export function useClientLogos() {
  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLogos(await getClientLogos());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addLogo = useCallback(async (data: ClientLogoFormData) => {
    const created = await createClientLogo(data);
    setLogos((prev) =>
      [...prev, created].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
      ),
    );
    return created;
  }, []);

  const editLogo = useCallback(async (id: string, data: ClientLogoFormData) => {
    await updateClientLogo(id, data);
    setLogos((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, ...data, updatedAt: new Date().toISOString() }
            : item,
        )
        .sort(
          (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
        ),
    );
  }, []);

  const removeLogo = useCallback(async (id: string) => {
    await deleteClientLogo(id);
    setLogos((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    logos,
    loading,
    error,
    refresh,
    addLogo,
    editLogo,
    removeLogo,
  };
}
