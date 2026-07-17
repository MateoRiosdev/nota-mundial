'use client';

import { useCallback, useEffect, useState } from 'react';

export type SavedGrade = {
  id: string;
  createdAt: string;
  mode: 'custom' | 'english';
  countryCode: string | null;
  score0to100: number;
  localGrade: number;
  scaleLabel: string;
  rows?: Array<{ label: string; percentage: number; grade: number }>;
};

const STORAGE_KEY = 'nota-mundial:saved-grades';

function readFromStorage(): SavedGrade[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedGrade[]) : [];
  } catch {
    return [];
  }
}

function writeToStorage(grades: SavedGrade[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(grades));
}

export function useSavedGrades() {
  const [savedGrades, setSavedGrades] = useState<SavedGrade[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSavedGrades(readFromStorage());
    setHydrated(true);
  }, []);

  const saveGrade = useCallback((grade: Omit<SavedGrade, 'id' | 'createdAt'>) => {
    setSavedGrades((prev) => {
      const next: SavedGrade[] = [
        ...prev,
        { ...grade, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
      ];
      writeToStorage(next);
      return next;
    });
  }, []);

  const deleteGrade = useCallback((id: string) => {
    setSavedGrades((prev) => {
      const next = prev.filter((g) => g.id !== id);
      writeToStorage(next);
      return next;
    });
  }, []);

  const clearGrades = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setSavedGrades([]);
  }, []);

  return {
    savedGrades,
    saveGrade,
    deleteGrade,
    clearGrades,
    count: savedGrades.length,
    hydrated,
  };
}