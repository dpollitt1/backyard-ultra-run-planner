export function formatDuration(totalSec: number): string {
  const safe = Math.max(0, Math.round(totalSec));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, "0")}m ${seconds
      .toString()
      .padStart(2, "0")}s`;
  }

  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

export function formatClock(iso?: string): string {
  if (!iso) {
    return "-";
  }

  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function toMinuteSecond(totalSec: number): { minutes: number; seconds: number } {
  const safe = Math.max(0, Math.round(totalSec));
  return {
    minutes: Math.floor(safe / 60),
    seconds: safe % 60,
  };
}

export function fromMinuteSecond(minutes: number, seconds: number): number {
  const safeMinutes = Number.isFinite(minutes) ? Math.max(0, Math.floor(minutes)) : 0;
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return safeMinutes * 60 + Math.min(59, safeSeconds);
}
