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

## Deploy to GitHub Pages

This repo is configured to auto-deploy to GitHub Pages on every push to `main` via GitHub Actions.

One-time setup in GitHub:

1. Open repo `Settings` -> `Pages`
2. Under `Build and deployment`, set `Source` to `GitHub Actions`
3. Push to `main` (or run the `Deploy To GitHub Pages` workflow manually)

Site URL:

- https://dpollitt1.github.io/backyard-ultra-run-planner/

## Test

```bash
npm run test
```

## Notes

- Lap distance is fixed at `4.167` miles in `lib/types.ts`.
- Lap window is fixed at `3600` seconds in `lib/types.ts`.
- All user data is kept in the browser under `byu.scenarios.v1`.
