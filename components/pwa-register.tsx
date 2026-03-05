"use client";

import { useEffect } from "react";

export function PwaRegister(): null {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // App can still run if SW registration fails.
      });
    }
  }, []);

  return null;
}
