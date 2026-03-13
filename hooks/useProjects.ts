import { useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import createContextHook from "@nkzw/create-context-hook";
import { Project } from "@/types";

const STORAGE_KEY = "renovation_projects_meta";
const IMAGE_KEY_PREFIX = "renovation_img_";
const MAX_IMAGE_SIZE = 2_000_000;

interface ProjectMeta extends Omit<Project, 'originalPhoto' | 'generatedPhoto'> {
  originalPhotoKey: string;
  generatedPhotoKey?: string;
}

function isBase64DataUri(data: string): boolean {
  return data.startsWith('data:') || data.length > 1000;
}

function compressBase64(data: string): string {
  if (data.length <= MAX_IMAGE_SIZE) return data;
  console.log(`Image large (${(data.length / 1024).toFixed(0)}KB), truncating for storage`);
  return data.substring(0, MAX_IMAGE_SIZE);
}

async function clearOldImages(keepKeys: string[]): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const imageKeys = allKeys.filter((k) => k.startsWith(IMAGE_KEY_PREFIX));
    const keepSet = new Set(keepKeys.map((k) => IMAGE_KEY_PREFIX + k));
    const toRemove = imageKeys.filter((k) => !keepSet.has(k));
    if (toRemove.length > 0) {
      await AsyncStorage.multiRemove(toRemove);
      console.log(`Cleared ${toRemove.length} orphaned image keys`);
    }
  } catch (error) {
    console.error("Failed to clear old images:", error);
  }
}

async function saveImage(key: string, data: string): Promise<boolean> {
  if (!data) return false;
  const compressed = isBase64DataUri(data) ? compressBase64(data) : data;
  if (!compressed) return false;
  try {
    await AsyncStorage.setItem(IMAGE_KEY_PREFIX + key, compressed);
    return true;
  } catch (_error) {
    console.warn("Storage quota hit for image:", key, "- keeping in memory only", _error);
    return false;
  }
}

async function loadImage(key: string): Promise<string> {
  try {
    const data = await AsyncStorage.getItem(IMAGE_KEY_PREFIX + key);
    return data ?? "";
  } catch (error) {
    console.error("Failed to load image:", key, error);
    return "";
  }
}

async function removeImage(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(IMAGE_KEY_PREFIX + key);
  } catch (error) {
    console.error("Failed to remove image:", key, error);
  }
}

function projectToMeta(project: Project): ProjectMeta {
  const { originalPhoto: _origPhoto, generatedPhoto, ...rest } = project;
  return {
    ...rest,
    originalPhotoKey: `orig_${project.id}`,
    generatedPhotoKey: generatedPhoto ? `gen_${project.id}` : undefined,
  };
}

async function loadProjects(): Promise<Project[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const metas = JSON.parse(stored) as ProjectMeta[];
      const projects = await Promise.all(
        metas.map(async (meta) => {
          const originalPhoto = await loadImage(meta.originalPhotoKey);
          const generatedPhoto = meta.generatedPhotoKey
            ? await loadImage(meta.generatedPhotoKey)
            : undefined;
          const { originalPhotoKey: _opk, generatedPhotoKey: _gpk, ...rest } = meta;
          return { ...rest, originalPhoto, generatedPhoto } as Project;
        })
      );
      console.log("Loaded projects:", projects.length);
      return projects;
    }
  } catch (error) {
    console.error("Failed to load projects:", error);
  }
  return [];
}

async function saveProjects(projects: Project[]): Promise<Project[]> {
  try {
    const allImageKeys: string[] = [];
    const metas: ProjectMeta[] = [];
    for (const project of projects) {
      const meta = projectToMeta(project);
      metas.push(meta);
      allImageKeys.push(meta.originalPhotoKey);
      if (meta.generatedPhotoKey) allImageKeys.push(meta.generatedPhotoKey);
    }
    await clearOldImages(allImageKeys);
    for (const project of projects) {
      const meta = projectToMeta(project);
      await saveImage(meta.originalPhotoKey, project.originalPhoto);
      if (project.generatedPhoto && meta.generatedPhotoKey) {
        await saveImage(meta.generatedPhotoKey, project.generatedPhoto);
      }
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(metas));
    console.log("Saved projects:", projects.length);
  } catch (error) {
    console.error("Failed to save projects:", error);
  }
  return projects;
}

export const [ProjectsProvider, useProjects] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [projects, setProjects] = useState<Project[]>([]);

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: loadProjects,
  });

  const { mutate: saveMutate } = useMutation({
    mutationFn: saveProjects,
    onSuccess: (savedProjects) => {
      queryClient.setQueryData(["projects"], savedProjects);
    },
  });

  useEffect(() => {
    if (projectsQuery.data && projects.length === 0) {
      setProjects(projectsQuery.data);
    }
  }, [projectsQuery.data, projects.length]);

  const addProject = useCallback(
    (project: Project) => {
      const updated = [project, ...projects];
      setProjects(updated);
      saveMutate(updated);
      console.log("Added project:", project.id);
    },
    [projects, saveMutate]
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<Project>) => {
      const updated = projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      );
      setProjects(updated);
      saveMutate(updated);
      console.log("Updated project:", id, updates.status);
    },
    [projects, saveMutate]
  );

  const deleteProject = useCallback(
    (id: string) => {
      void removeImage(`orig_${id}`);
      void removeImage(`gen_${id}`);
      const updated = projects.filter((p) => p.id !== id);
      setProjects(updated);
      saveMutate(updated);
      console.log("Deleted project:", id);
    },
    [projects, saveMutate]
  );

  const getProject = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects]
  );

  return useMemo(() => ({
    projects,
    isLoading: projectsQuery.isLoading,
    addProject,
    updateProject,
    deleteProject,
    getProject,
    completedProjects: projects.filter((p) => p.status === "completed"),
    recentProjects: projects.slice(0, 5),
  }), [projects, projectsQuery.isLoading, addProject, updateProject, deleteProject, getProject]);
});
