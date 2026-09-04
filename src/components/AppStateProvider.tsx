"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Shelf } from "@/lib/types";

/**
 * The bits of state the prototype actually keeps: which books are shelved and
 * whether "Use my reading history" is on. Both appear on more than one screen
 * in the design, so they have to survive navigation.
 *
 * There is no conversation state — the results screen renders the designed
 * content, not a history of turns.
 */
interface AppState {
  shelves: Record<string, Shelf>;
  setShelf: (bookId: string, shelf: Shelf | null) => void;

  useHistory: boolean;
  setUseHistory: (next: boolean) => void;
}

const Context = createContext<AppState | null>(null);

const STORAGE_KEY = "book-rec:state:v1";

interface Persisted {
  shelves: Record<string, Shelf>;
  useHistory: boolean;
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [shelves, setShelves] = useState<Record<string, Shelf>>({});
  // The design ships the switch on by default (287:603 "Property 1=Default").
  const [useHistory, setUseHistory] = useState(true);

  // Hydrate after mount so the server and first client render agree.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<Persisted>;
      if (parsed.shelves) setShelves(parsed.shelves);
      if (typeof parsed.useHistory === "boolean") setUseHistory(parsed.useHistory);
    } catch {
      // A corrupt or unavailable store just means we start from defaults.
    }
  }, []);

  useEffect(() => {
    try {
      const payload: Persisted = { shelves, useHistory };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Private-mode storage failures are not worth surfacing here.
    }
  }, [shelves, useHistory]);

  const setShelf = useCallback((bookId: string, shelf: Shelf | null) => {
    setShelves((current) => {
      const next = { ...current };
      if (shelf === null) delete next[bookId];
      else next[bookId] = shelf;
      return next;
    });
  }, []);

  const value = useMemo<AppState>(
    () => ({ shelves, setShelf, useHistory, setUseHistory }),
    [shelves, setShelf, useHistory],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAppState(): AppState {
  const value = useContext(Context);
  if (!value) throw new Error("useAppState must be used inside an AppStateProvider");
  return value;
}
