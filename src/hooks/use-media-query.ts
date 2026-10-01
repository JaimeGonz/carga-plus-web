"use client";

import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  function subscribe(callback: () => void) {
    const mediaQueryList = window.matchMedia(query);
    mediaQueryList.addEventListener("change", callback);
    return () => mediaQueryList.removeEventListener("change", callback);
  }

  function getSnapshot() {
    return window.matchMedia(query).matches;
  }

  function getServerSnapshot() {
    return false;
  }
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
