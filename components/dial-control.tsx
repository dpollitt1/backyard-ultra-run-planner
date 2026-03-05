"use client";

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  display: string;
  variant?: "pace" | "laps";
  onChange: (value: number) => void;
};

export function DialControl({
  label,
  value,
  min,
  max,
  step,
  unit,
  display,
  variant = "pace",
  onChange,
}: Props) {
  const clamped = Math.min(max, Math.max(min, value));
  const percent = ((clamped - min) / (max - min)) * 100;
  const progress = percent / 100;
  const rings = [
    { key: "move", radius: 76, progress },
    { key: "exercise", radius: 62, progress: Math.min(1, progress * 0.96) },
    { key: "stand", radius: 48, progress: Math.min(1, progress * 0.92) },
  ] as const;

  return (
    <section className="dial-card" aria-label={label}>
      <header>
        <p className="dial-label">{label}</p>
      </header>
      <div className={`activity-ring ${variant}`}>
        <svg className="ring-svg" viewBox="0 0 200 200" aria-hidden="true">
          {rings.map((ring) => {
            const circumference = 2 * Math.PI * ring.radius;
            const dashoffset = circumference * (1 - ring.progress);
            return (
              <g key={ring.key}>
                <circle
                  className="ring-track"
                  cx="100"
                  cy="100"
                  r={ring.radius}
                  strokeWidth="13"
                />
                <circle
                  className={`ring-progress ${ring.key}`}
                  cx="100"
                  cy="100"
                  r={ring.radius}
                  strokeWidth="13"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashoffset}
                  transform="rotate(-90 100 100)"
                />
              </g>
            );
          })}
        </svg>
        <div className="dial-center">
          <p className="dial-value">{display}</p>
          <p className="dial-unit">{unit}</p>
        </div>
      </div>
      <input
        className="dial-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </section>
  );
}
