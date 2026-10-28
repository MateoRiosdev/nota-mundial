"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AUTOSAVE_KEY,
  PLANNER_KEY,
  initialPlanner,
  parsePlanner,
  PlannerData,
} from "./planner";

export function usePlanner(defaultPage: string, leaveMessage: string) {
  const [data, setData] = useState<PlannerData>(() =>
    initialPlanner(defaultPage),
  );
  const [hydrated, setHydrated] = useState(false);
  const [autosave, setAutosave] = useState(false);
  const [saved, setSaved] = useState("");
  const [error, setError] = useState<
    "storageError" | "corruptData" | "conflict" | null
  >(null);
  const initialName = useRef(defaultPage);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PLANNER_KEY);
      const next = raw
        ? parsePlanner(raw)
        : initialPlanner(initialName.current);
      setData(next);
      setSaved(JSON.stringify(next));
      setAutosave(localStorage.getItem(AUTOSAVE_KEY) === "true");
    } catch (e) {
      setError(
        e instanceof SyntaxError ||
          (e instanceof Error && e.message.startsWith("Invalid"))
          ? "corruptData"
          : "storageError",
      );
    }
    setHydrated(true);
  }, []);
  const serialized = JSON.stringify(data);
  const dirty = hydrated && serialized !== saved;
  const save = useCallback(() => {
    try {
      localStorage.setItem(PLANNER_KEY, serialized);
      setSaved(serialized);
      setError(null);
      return true;
    } catch {
      setError("storageError");
      return false;
    }
  }, [serialized]);
  const toggleAutosave = () => {
    const next = !autosave;
    if (next && !save()) return;
    try {
      localStorage.setItem(AUTOSAVE_KEY, String(next));
      setAutosave(next);
    } catch {
      setError("storageError");
    }
  };
  useEffect(() => {
    if (!hydrated || !autosave || !dirty || error) return;
    const timer = setTimeout(save, 350);
    return () => clearTimeout(timer);
  }, [hydrated, autosave, dirty, save, error]);
  useEffect(() => {
    const unload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const navigate = (e: Event) => {
      if (dirty && !window.confirm(leaveMessage)) e.preventDefault();
    };
    window.addEventListener("beforeunload", unload);
    window.addEventListener("nota-mundial:before-navigation", navigate);
    return () => {
      window.removeEventListener("beforeunload", unload);
      window.removeEventListener("nota-mundial:before-navigation", navigate);
    };
  }, [dirty, leaveMessage]);
  useEffect(() => {
    const storage = (e: StorageEvent) => {
      if (e.key === PLANNER_KEY || e.key === null) {
        setAutosave(false);
        setError("conflict");
      }
      if (e.key === AUTOSAVE_KEY && e.newValue !== "true") setAutosave(false);
    };
    window.addEventListener("storage", storage);
    return () => window.removeEventListener("storage", storage);
  }, []);
  return {
    data,
    setData,
    hydrated,
    autosave,
    toggleAutosave,
    dirty,
    save,
    error,
  };
}
