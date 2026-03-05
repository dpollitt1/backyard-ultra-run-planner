"use client";

import { useEffect } from "react";

export function PwaRegister(): null {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      navigator.serviceWorker.register(`${basePath}/sw.js`).catch(() => {
        // App can still run if SW registration fails.
      });
    }
  }, []);

  return null;
}
