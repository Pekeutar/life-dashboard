"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Custom event name for same-tab localStorage sync.
 * The native `storage` event only fires across tabs.
 */
const LOCAL_STORAGE_EVENT = "local-storage-update";

/**
 * SSR-safe localStorage hook.
 * - Returns the initial value on the server and during the first render on the client.
 * - Hydrates from localStorage after mount, then keeps state in sync.
 * - Writes back to localStorage on every update.
 * - Syncs across components in the same tab AND across tabs.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [hydrated, setHydrated] = useState(false);
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setValue(JSON.parse(item) as T);
      }
    } catch (err) {
      console.warn(`[useLocalStorage] failed to read ${key}`, err);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
          // Notify other hook instances in the same tab (deferred to avoid setState-during-render)
          queueMicrotask(() => {
            window.dispatchEvent(
              new CustomEvent(LOCAL_STORAGE_EVENT, { detail: { key } })
            );
          });
        } catch (err) {
          console.warn(`[useLocalStorage] failed to write ${key}`, err);
        }
        return resolved;
      });
    },
    [key]
  );

  // Cross-tab sync (native storage event)
  // + same-tab sync (custom event)
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== key || e.newValue === null) return;
      try {
        setValue(JSON.parse(e.newValue) as T);
      } catch {
        /* ignore */
      }
    }

    function onLocalUpdate(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.key !== key) return;
      try {
        const item = window.localStorage.getItem(key);
        if (item !== null) {
          setValue(JSON.parse(item) as T);
        }
      } catch {
        /* ignore */
      }
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener(LOCAL_STORAGE_EVENT, onLocalUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(LOCAL_STORAGE_EVENT, onLocalUpdate);
    };
  }, [key]);

  return [value, update, hydrated];
}
