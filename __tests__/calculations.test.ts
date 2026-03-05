import { describe, expect, it } from "vitest";
import { simulateBackyardUltra } from "@/lib/calculations";
import { fromMinuteSecond } from "@/lib/time";
import { LAP_WINDOW_SEC } from "@/lib/types";

describe("simulateBackyardUltra", () => {
  it("uses fixed backyard ultra lap distance", () => {
    const result = simulateBackyardUltra({
      lapRunSec: fromMinuteSecond(50, 0),
      targetLaps: 3,
    });

    expect(result.summary.totalDistanceMiles).toBe(12.501);
  });

  it("forces each valid lap to fit exactly in 60 minutes", () => {
    const result = simulateBackyardUltra({
      lapRunSec: fromMinuteSecond(47, 30),
      targetLaps: 2,
    });

    expect(result.summary.isDisqualified).toBe(false);
    expect(result.summary.totalElapsedSec).toBe(LAP_WINDOW_SEC * 2);
    expect(result.summary.totalRunSec + result.summary.totalRestSec).toBe(LAP_WINDOW_SEC * 2);
  });

  it("clamps lap run time below 60 minutes", () => {
    const result = simulateBackyardUltra({
      lapRunSec: fromMinuteSecond(70, 0),
      targetLaps: 4,
    });

    expect(result.summary.isDisqualified).toBe(false);
    expect(result.summary.lapRunSec).toBe(3599);
    expect(result.summary.restPerLapSec).toBe(1);
    expect(result.laps).toHaveLength(4);
  });
});
