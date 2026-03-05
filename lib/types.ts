export const LAP_DISTANCE_MILES = 4.167;
export const LAP_WINDOW_SEC = 3600;
export const MIN_PACE_SEC_PER_MILE = 480;
export const MIN_RUN_SEC_PER_LAP = Math.ceil(MIN_PACE_SEC_PER_MILE * LAP_DISTANCE_MILES);
export const MAX_PACE_SEC_PER_MILE = LAP_WINDOW_SEC / LAP_DISTANCE_MILES;

export type ScenarioInput = {
  id: string;
  name: string;
  lapRunSec: number;
  targetLaps: number;
  startTimeIso?: string;
  createdAtIso: string;
  updatedAtIso: string;
};

export type LapProjection = {
  lap: number;
  distanceMiles: number;
  runSec: number;
  restSec: number;
  lapStartIso?: string;
  lapFinishIso?: string;
  restEndIso?: string;
  cumulativeSec: number;
};

export type SimulationSummary = {
  totalElapsedSec: number;
  totalRunSec: number;
  totalRestSec: number;
  lapRunSec: number;
  restPerLapSec: number;
  paceSecPerMile: number;
  totalDistanceMiles: number;
  avgMph: number;
  isDisqualified: boolean;
  maxAllowedPaceSecPerMile: number;
};

export type SimulationResult = {
  laps: LapProjection[];
  summary: SimulationSummary;
};
