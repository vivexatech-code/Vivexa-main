"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from "@/lib/firebase/projects";
import type { Project, ProjectFormData } from "@/types/project";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProjects(await getProjects());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addProject = useCallback(async (data: ProjectFormData) => {
    const created = await createProject(data);
    setProjects((prev) => [created, ...prev]);
    return created;
  }, []);

  const editProject = useCallback(async (id: string, data: ProjectFormData) => {
    await updateProject(id, data);
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id
          ? { ...project, ...data, updatedAt: new Date().toISOString() }
          : project,
      ),
    );
  }, []);

  const removeProject = useCallback(async (id: string) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((project) => project.id !== id));
  }, []);

  return {
    projects,
    loading,
    error,
    refresh,
    addProject,
    editProject,
    removeProject,
  };
}
