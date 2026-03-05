import {
  LAP_DISTANCE_MILES,
  LAP_WINDOW_SEC,
  MIN_RUN_SEC_PER_LAP,
  type ScenarioInput,
} from "@/lib/types";

const STORAGE_KEY = "byu.scenarios.v1";

export function loadScenarios(): ScenarioInput[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as Array<Partial<ScenarioInput> & { paceSecPerMile?: number }>;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => {
        const fallbackRunSec =
          typeof item.paceSecPerMile === "number"
            ? Math.round(item.paceSecPerMile * LAP_DISTANCE_MILES)
            : undefined;

        const lapRunSecRaw =
          typeof item.lapRunSec === "number" ? item.lapRunSec : fallbackRunSec ?? 3000;

        return {
          id: item.id ?? crypto.randomUUID(),
          name: item.name ?? "Strategy",
          lapRunSec: Math.max(
            MIN_RUN_SEC_PER_LAP,
            Math.min(LAP_WINDOW_SEC - 1, Math.round(lapRunSecRaw)),
          ),
          targetLaps:
            typeof item.targetLaps === "number"
              ? Math.max(1, Math.round(item.targetLaps))
              : 12,
          startTimeIso: item.startTimeIso,
          createdAtIso: item.createdAtIso ?? new Date().toISOString(),
          updatedAtIso: item.updatedAtIso ?? new Date().toISOString(),
        } satisfies ScenarioInput;
      })
      .filter((item) => Boolean(item.id));
  } catch {
    return [];
  }
}

export function saveScenarios(scenarios: ScenarioInput[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
}

export function createScenarioName(existing: ScenarioInput[]): string {
  const prefix = "Strategy";
  let i = 1;
  const names = new Set(existing.map((scenario) => scenario.name));

  while (names.has(`${prefix} ${i}`)) {
    i += 1;
  }

  return `${prefix} ${i}`;
}
