"use client";

import { useEffect, useMemo, useState } from "react";
import { simulateBackyardUltra } from "@/lib/calculations";
import { createScenarioName, loadScenarios, saveScenarios } from "@/lib/storage";
import { formatClock, formatDuration, fromMinuteSecond, toMinuteSecond } from "@/lib/time";
import { LAP_WINDOW_SEC, MIN_RUN_SEC_PER_LAP, type ScenarioInput } from "@/lib/types";

const DEFAULT_SCENARIO: ScenarioInput = {
  id: crypto.randomUUID(),
  name: "Strategy 1",
  lapRunSec: fromMinuteSecond(50, 0),
  targetLaps: 12,
  startTimeIso: undefined,
  createdAtIso: new Date().toISOString(),
  updatedAtIso: new Date().toISOString(),
};

type RestBand = {
  label: string;
  icon: string;
  hint: string;
  className: string;
};

function formatPace(valueSec: number): string {
  const { minutes, seconds } = toMinuteSecond(valueSec);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function getRestBand(restSec: number): RestBand {
  const restMin = restSec / 60;

  if (restMin <= 2) {
    return {
      label: "Critical",
      icon: "🚨",
      hint: "2:00 or less is risky and hard to sustain.",
      className: "rest-critical",
    };
  }

  if (restMin <= 5) {
    return {
      label: "Caution",
      icon: "⚠️",
      hint: "2:00 to 5:00 is tight. Margin is limited.",
      className: "rest-caution",
    };
  }

  if (restMin <= 12) {
    return {
      label: "Perfect",
      icon: "✅",
      hint: "5:00 to 12:00 is the ideal working range.",
      className: "rest-perfect",
    };
  }

  if (restMin <= 15) {
    return {
      label: "Okay",
      icon: "🟡",
      hint: "12:00 to 15:00 is usable but likely more than needed.",
      className: "rest-okay",
    };
  }

  return {
    label: "Too Much",
    icon: "⏱️",
    hint: "15:00+ means you may be leaving too much on the table.",
    className: "rest-excess",
  };
}

function clampUnderHour(totalSec: number): number {
  return Math.max(MIN_RUN_SEC_PER_LAP, Math.min(LAP_WINDOW_SEC - 1, Math.round(totalSec)));
}

export default function HomePage() {
  const [scenarios, setScenarios] = useState<ScenarioInput[]>([]);
  const [activeId, setActiveId] = useState<string>(DEFAULT_SCENARIO.id);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = loadScenarios();
    if (saved.length === 0) {
      setScenarios([DEFAULT_SCENARIO]);
      setActiveId(DEFAULT_SCENARIO.id);
      saveScenarios([DEFAULT_SCENARIO]);
    } else {
      setScenarios(saved);
      setActiveId(saved[0].id);
    }
    setLoaded(true);
  }, []);

  const activeScenario =
    scenarios.find((scenario) => scenario.id === activeId) ?? scenarios[0] ?? DEFAULT_SCENARIO;

  const simulation = useMemo(() => {
    return simulateBackyardUltra(activeScenario);
  }, [activeScenario]);

  const projectedFinish = simulation.laps.at(-1)?.restEndIso;
  const lapTimeParts = toMinuteSecond(simulation.summary.lapRunSec);
  const restParts = toMinuteSecond(simulation.summary.restPerLapSec);
  const restBand = getRestBand(simulation.summary.restPerLapSec);

  function updateScenario(patch: Partial<ScenarioInput>) {
    const next = scenarios.map((scenario) =>
      scenario.id === activeScenario.id
        ? { ...scenario, ...patch, updatedAtIso: new Date().toISOString() }
        : scenario,
    );
    setScenarios(next);
    saveScenarios(next);
  }

  function updateLapRunSec(nextRunSec: number) {
    updateScenario({ lapRunSec: clampUnderHour(nextRunSec) });
  }

  function updateRestSec(nextRestSec: number) {
    const maxRest = LAP_WINDOW_SEC - MIN_RUN_SEC_PER_LAP;
    const clampedRest = Math.max(1, Math.min(maxRest, Math.round(nextRestSec)));
    updateScenario({ lapRunSec: LAP_WINDOW_SEC - clampedRest });
  }

  function createScenario() {
    const now = new Date().toISOString();
    const newScenario: ScenarioInput = {
      ...activeScenario,
      id: crypto.randomUUID(),
      name: createScenarioName(scenarios),
      createdAtIso: now,
      updatedAtIso: now,
    };

    const next = [newScenario, ...scenarios];
    setScenarios(next);
    setActiveId(newScenario.id);
    saveScenarios(next);
  }

  function duplicateScenario() {
    const now = new Date().toISOString();
    const copy: ScenarioInput = {
      ...activeScenario,
      id: crypto.randomUUID(),
      name: `${activeScenario.name} Copy`,
      createdAtIso: now,
      updatedAtIso: now,
    };

    const next = [copy, ...scenarios];
    setScenarios(next);
    setActiveId(copy.id);
    saveScenarios(next);
  }

  function deleteScenario(id: string) {
    if (scenarios.length <= 1) {
      return;
    }

    const next = scenarios.filter((scenario) => scenario.id !== id);
    setScenarios(next);
    if (activeId === id) {
      setActiveId(next[0].id);
    }
    saveScenarios(next);
  }

  if (!loaded) {
    return <main className="page-shell">Loading planner...</main>;
  }

  return (
    <main className="page-shell">
      <section className="app-header glass-panel">
        <h1>Backyard Ultra Run Planner</h1>
        <p>Set either lap run time or rest per lap. The other value updates automatically.</p>
      </section>

      <section className="summary-grid">
        <article className="metric-card glass-panel">
          <h2>Run Time / Lap</h2>
          <p>{formatDuration(simulation.summary.lapRunSec)}</p>
        </article>
        <article className={`metric-card glass-panel ${restBand.className}`}>
          <h2>Rest / Lap</h2>
          <p>
            {restBand.icon} {formatDuration(simulation.summary.restPerLapSec)}
          </p>
        </article>
        <article className="metric-card glass-panel">
          <h2>Pace / Mile</h2>
          <p>{formatPace(Math.round(simulation.summary.paceSecPerMile))}</p>
        </article>
        <article className="metric-card glass-panel">
          <h2>Total Distance</h2>
          <p>{simulation.summary.totalDistanceMiles.toFixed(3)} mi</p>
        </article>
      </section>

      <section className="controls-grid">
        <article className="control-card glass-panel">
          <h2>Run Time / Lap</h2>
          <p className="control-value">{formatPace(simulation.summary.lapRunSec)}</p>
          <input
            type="range"
            min={MIN_RUN_SEC_PER_LAP}
            max={fromMinuteSecond(59, 59)}
            step={5}
            value={simulation.summary.lapRunSec}
            onChange={(event) => updateLapRunSec(Number(event.currentTarget.value))}
          />
          <p className="control-note">Auto-linked with rest in a fixed 60:00 lap cycle.</p>
        </article>

        <article className="control-card glass-panel">
          <h2>Rest / Lap</h2>
          <p className="control-value">{formatPace(simulation.summary.restPerLapSec)}</p>
          <input
            type="range"
            min={1}
            max={LAP_WINDOW_SEC - MIN_RUN_SEC_PER_LAP}
            step={5}
            value={simulation.summary.restPerLapSec}
            onChange={(event) => updateRestSec(Number(event.currentTarget.value))}
          />
          <p className="control-note">Auto-linked to run time in a fixed 60:00 lap cycle.</p>
        </article>

        <article className="timeline-card glass-panel">
          <h2>Timeline Strip</h2>
          <p className="timeline-lede">
            Boundary marker shows where run ends and rest begins in each 60-minute lap.
          </p>
          <div className="timeline-strip" aria-label="60 minute lap timeline">
            <div className="timeline-run" style={{ width: `${(simulation.summary.lapRunSec / LAP_WINDOW_SEC) * 100}%` }} />
            <div className="timeline-rest" style={{ width: `${(simulation.summary.restPerLapSec / LAP_WINDOW_SEC) * 100}%` }} />
            <div
              className="timeline-boundary"
              style={{ left: `${(simulation.summary.lapRunSec / LAP_WINDOW_SEC) * 100}%` }}
              aria-hidden="true"
            />
          </div>
          <div className="timeline-ticks" aria-hidden="true">
            {[0, 15, 30, 45, 50, 55, 60].map((minute) => (
              <span
                key={minute}
                className={`timeline-tick ${minute === 0 ? "start" : ""} ${
                  minute === 60 ? "end" : ""
                }`}
                style={{ left: `${(minute / 60) * 100}%` }}
              >
                {minute}
              </span>
            ))}
          </div>
          <div className="timeline-labels">
            <p>Run ends at {formatPace(simulation.summary.lapRunSec)}</p>
            <p>Rest ends at 60:00</p>
          </div>
        </article>
      </section>

      <section className="precise-inputs">
        <article className="input-card glass-panel">
          <h2>Run Time / Lap (mm:ss, must be under 60:00)</h2>
          <div className="inline-inputs">
            <input
              type="number"
              min={0}
              max={59}
              value={lapTimeParts.minutes}
              onChange={(event) =>
                updateLapRunSec(
                  fromMinuteSecond(Number(event.currentTarget.value), lapTimeParts.seconds),
                )
              }
            />
            <input
              type="number"
              min={0}
              max={59}
              value={lapTimeParts.seconds}
              onChange={(event) =>
                updateLapRunSec(
                  fromMinuteSecond(lapTimeParts.minutes, Number(event.currentTarget.value)),
                )
              }
            />
          </div>
        </article>

        <article className="input-card glass-panel">
          <h2>Rest / Lap (mm:ss, must be under 60:00)</h2>
          <div className="inline-inputs">
            <input
              type="number"
              min={0}
              max={59}
              value={restParts.minutes}
              onChange={(event) =>
                updateRestSec(fromMinuteSecond(Number(event.currentTarget.value), restParts.seconds))
              }
            />
            <input
              type="number"
              min={0}
              max={59}
              value={restParts.seconds}
              onChange={(event) =>
                updateRestSec(fromMinuteSecond(restParts.minutes, Number(event.currentTarget.value)))
              }
            />
          </div>
        </article>

        <article className="input-card glass-panel">
          <h2>Number of Laps (optional)</h2>
          <input
            type="number"
            min={1}
            max={200}
            value={activeScenario.targetLaps}
            onChange={(event) =>
              updateScenario({
                targetLaps: Math.max(1, Math.min(200, Number(event.currentTarget.value) || 12)),
              })
            }
          />
          <p>Defaults to 12 laps for planning.</p>
        </article>

        <article className="input-card glass-panel">
          <h2>Secondary Metrics</h2>
          <p>Pace / mile: {formatPace(Math.round(simulation.summary.paceSecPerMile))}</p>
          <p>Total Elapsed: {formatDuration(simulation.summary.totalElapsedSec)}</p>
          <p>Total Run: {formatDuration(simulation.summary.totalRunSec)}</p>
          <p>Total Rest: {formatDuration(simulation.summary.totalRestSec)}</p>
          <p>Projected Finish: {formatClock(projectedFinish)}</p>
        </article>
      </section>

      <section className="scenario-section glass-panel">
        <div className="scenario-head">
          <h2>Scenarios</h2>
          <div className="scenario-actions">
            <button type="button" onClick={createScenario}>
              New
            </button>
            <button type="button" onClick={duplicateScenario}>
              Duplicate
            </button>
          </div>
        </div>
        <div className="scenario-list">
          {scenarios.map((scenario) => (
            <article
              key={scenario.id}
              className={`scenario-item ${scenario.id === activeScenario.id ? "active" : ""}`}
            >
              <button
                type="button"
                className="scenario-select"
                onClick={() => setActiveId(scenario.id)}
              >
                {scenario.name}
              </button>
              <input
                aria-label={`Rename ${scenario.name}`}
                value={scenario.name}
                onChange={(event) => {
                  const next = scenarios.map((item) =>
                    item.id === scenario.id
                      ? {
                          ...item,
                          name: event.currentTarget.value,
                          updatedAtIso: new Date().toISOString(),
                        }
                      : item,
                  );
                  setScenarios(next);
                  saveScenarios(next);
                }}
              />
              <button type="button" className="danger" onClick={() => deleteScenario(scenario.id)}>
                Delete
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="relationship-panel glass-panel">
        <h2>Pace to Rest Relationship</h2>
        <p className="relationship-lede">
          Fixed 60:00 cycle: faster run time per lap creates more rest, slower run time creates less rest.
        </p>
        <div className="relationship-rules">
          <div className="rule-item good">
            <span className="rule-icon">📈</span>
            <p>Lower run time / lap -> more rest.</p>
          </div>
          <div className="rule-item bad">
            <span className="rule-icon">📉</span>
            <p>Higher run time / lap -> less rest.</p>
          </div>
        </div>
        <div className="rest-band-grid">
          <span className="rest-chip rest-critical">🚨 0:00-2:00 Critical</span>
          <span className="rest-chip rest-caution">⚠️ 2:01-5:00 Caution</span>
          <span className="rest-chip rest-perfect">✅ 5:01-12:00 Perfect</span>
          <span className="rest-chip rest-okay">🟡 12:01-15:00 Okay</span>
          <span className="rest-chip rest-excess">⏱️ 15:01+ Too Much</span>
        </div>
        <p className="rest-band-hint">
          Current status: <strong>{restBand.icon} {restBand.label}</strong> - {restBand.hint}
        </p>
      </section>

      <section className="table-section glass-panel">
        <h2>Lap Schedule</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Lap</th>
                <th>Miles</th>
                <th>Run</th>
                <th>Rest</th>
                <th>Lap Start</th>
                <th>Lap Finish</th>
                <th>Rest End</th>
                <th>Cumulative</th>
              </tr>
            </thead>
            <tbody>
              {simulation.laps.map((lap) => (
                <tr key={lap.lap}>
                  <td>{lap.lap}</td>
                  <td>{lap.distanceMiles.toFixed(3)}</td>
                  <td>{formatDuration(lap.runSec)}</td>
                  <td>{formatDuration(lap.restSec)}</td>
                  <td>{formatClock(lap.lapStartIso)}</td>
                  <td>{formatClock(lap.lapFinishIso)}</td>
                  <td>{formatClock(lap.restEndIso)}</td>
                  <td>{formatDuration(lap.cumulativeSec)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
