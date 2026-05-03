# MicroMoment

A focused habit tracker built around the "5 minutes a day" philosophy. Hard cap of 5 active habits, durations of 1–5 minutes each, single daily check-in. Local-first (SQLite on-device, no account, no sync).

## Documentation

- [`docs/ProductSpec.md`](docs/ProductSpec.md) — purpose, features, user flows, acceptance criteria
- [`docs/DesignSpec.md`](docs/DesignSpec.md) — design tokens, components, screens, motion
- [`docs/DataModel.md`](docs/DataModel.md) — DB schema, store, notifications

## Tech stack

- **Framework**: Expo SDK 55 / React Native 0.83 / React 19
- **Routing**: expo-router (typed routes, stack + tabs)
- **State**: Zustand
- **Database**: expo-sqlite (WAL, FK on)
- **Notifications**: expo-notifications (per-habit daily, Android channel)
- **Animation**: Reanimated 4, gesture-handler, draggable-flatlist, confetti-cannon
- **Analytics**: Sentry, PostHog (optional)
- **Tests**: Jest unit tests, YAML-based E2E scenarios
- **Build**: EAS

Targets iOS 16+ and Android API 26+. Portrait only. Phone only.

## Getting started

```bash
npm install
npx expo start
```

Run on a device/simulator from the Expo CLI menu. For native builds use `eas build` (see `eas.json`).

## Project layout

```
app/             expo-router screens
components/      reusable UI (Button, HabitCard, CheckButton, …)
constants/       colors, typography, daily messages
db/              SQLite schema + queries
store/           Zustand stores
hooks/           shared hooks
utils/           streak calc, notifications, helpers
__tests__/       Jest unit tests
e2e/             YAML E2E scenarios + run_all.sh
```

## Scripts

See `package.json` for the full list. Common ones:

- `npm test` — run Jest
- `npx expo start` — dev server
- `eas build` — native build via EAS

## Contributing

When changing user-facing behavior, update the relevant doc under `docs/` in the same PR.
