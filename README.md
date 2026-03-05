# Backyard Ultra Planner

Mobile-first PWA to model Backyard Ultra pacing strategies with a fixed 4.167-mile lap distance.

## Features

- Main inputs are lap run time and rest per lap (both under 60:00)
- Entering either lap time or rest auto-calculates the other in a fixed 60:00 cycle
- Optional laps input (default 12) auto-calculates total distance
- Lap-by-lap schedule and race summary metrics
- Multiple named scenarios stored in local browser storage
- Installable offline web app (PWA)

## Stack

- Next.js (App Router) + TypeScript
- Local-only persistence (no backend required)

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Test

```bash
npm run test
```

## Notes

- Lap distance is fixed at `4.167` miles in `lib/types.ts`.
- Lap window is fixed at `3600` seconds in `lib/types.ts`.
- All user data is kept in the browser under `byu.scenarios.v1`.
