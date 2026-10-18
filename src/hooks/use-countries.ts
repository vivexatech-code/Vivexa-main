"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createCountry,
  deleteCountry,
  getCountries,
  updateCountry,
} from "@/lib/firebase/countries";
import type { Country, CountryFormData } from "@/types/country";

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCountries(await getCountries());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load countries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addCountry = useCallback(async (data: CountryFormData) => {
    const created = await createCountry(data);
    setCountries((prev) =>
      [...prev, created].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
      ),
    );
    return created;
  }, []);

  const editCountry = useCallback(async (id: string, data: CountryFormData) => {
    await updateCountry(id, data);
    setCountries((prev) =>
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

  const removeCountry = useCallback(async (id: string) => {
    await deleteCountry(id);
    setCountries((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    countries,
    loading,
    error,
    refresh,
    addCountry,
    editCountry,
    removeCountry,
  };
}
