import {
  LAP_DISTANCE_MILES,
  MIN_RUN_SEC_PER_LAP,
  LAP_WINDOW_SEC,
  MAX_PACE_SEC_PER_MILE,
  type LapProjection,
  type SimulationResult,
  type SimulationSummary,
} from "@/lib/types";

type Inputs = {
  lapRunSec: number;
  targetLaps: number;
  startTimeIso?: string;
};

export function simulateBackyardUltra(inputs: Inputs): SimulationResult {
  const lapRunSec = Math.max(
    MIN_RUN_SEC_PER_LAP,
    Math.min(LAP_WINDOW_SEC - 1, Math.round(inputs.lapRunSec)),
  );
  const targetLaps = Math.max(1, Math.round(inputs.targetLaps));

  const paceSecPerMile = lapRunSec / LAP_DISTANCE_MILES;
  const runSec = lapRunSec;
  const restSecPerLap = LAP_WINDOW_SEC - runSec;
  const isDisqualified = false;
  const laps: LapProjection[] = [];

  const startMillis = inputs.startTimeIso ? new Date(inputs.startTimeIso).getTime() : NaN;

  if (!isDisqualified) {
    for (let lap = 1; lap <= targetLaps; lap += 1) {
      const lapStartSec = (lap - 1) * LAP_WINDOW_SEC;
      const lapFinishSec = lapStartSec + runSec;
      const restEndSec = lap * LAP_WINDOW_SEC;

      const lapProjection: LapProjection = {
        lap,
        distanceMiles: Number((lap * LAP_DISTANCE_MILES).toFixed(3)),
        runSec,
        restSec: restSecPerLap,
        cumulativeSec: restEndSec,
      };

      if (Number.isFinite(startMillis)) {
        lapProjection.lapStartIso = new Date(startMillis + lapStartSec * 1000).toISOString();
        lapProjection.lapFinishIso = new Date(startMillis + lapFinishSec * 1000).toISOString();
        lapProjection.restEndIso = new Date(startMillis + restEndSec * 1000).toISOString();
      }

      laps.push(lapProjection);
    }
  }

  const completedLaps = isDisqualified ? 0 : targetLaps;
  const totalElapsedSec = completedLaps * LAP_WINDOW_SEC;
  const totalRunSec = completedLaps * runSec;
  const totalRestSec = completedLaps * restSecPerLap;
  const totalDistanceMiles = Number((completedLaps * LAP_DISTANCE_MILES).toFixed(3));
  const avgMph = totalElapsedSec === 0 ? 0 : Number(((totalDistanceMiles / totalElapsedSec) * 3600).toFixed(2));

  const summary: SimulationSummary = {
    totalElapsedSec,
    totalRunSec,
    totalRestSec,
    lapRunSec,
    restPerLapSec: restSecPerLap,
    paceSecPerMile,
    totalDistanceMiles,
    avgMph,
    isDisqualified,
    maxAllowedPaceSecPerMile: MAX_PACE_SEC_PER_MILE,
  };

  return { laps, summary };
}
