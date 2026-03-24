import Constants from 'expo-constants'

// Both SDKs are imported lazily so a missing native module doesn't crash Expo Go.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Sentry: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let posthog: any = null

export function initAnalytics(): void {
  const extra = Constants.expoConfig?.extra as Record<string, string> | undefined
  const sentryDsn: string = extra?.sentryDsn ?? ''
  const posthogKey: string = extra?.posthogApiKey ?? ''
  const posthogHost: string = extra?.posthogHost ?? 'https://app.posthog.com'

  try {
    if (sentryDsn && !Sentry) {
      Sentry = require('@sentry/react-native')
      Sentry.init({
        dsn: sentryDsn,
        enableAutoSessionTracking: true,
        tracesSampleRate: 0.2,
      })
    }
  } catch {
    // Sentry native module unavailable (e.g. Expo Go) — skip silently
    Sentry = null
  }

  try {
    if (posthogKey && !posthog) {
      const { PostHog } = require('posthog-react-native')
      posthog = new PostHog(posthogKey, { host: posthogHost })
    }
  } catch {
    // PostHog unavailable — skip silently
    posthog = null
  }
}

export function captureEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null>
): void {
  try {
    posthog?.capture(event, properties)
  } catch {
    // Analytics must never crash the app
  }
}

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  try {
    if (!Sentry) return
    if (context) {
      Sentry.withScope((scope: { setExtras: (c: unknown) => void }) => {
        scope.setExtras(context)
        Sentry.captureException(error)
      })
    } else {
      Sentry.captureException(error)
    }
  } catch {
    // Analytics must never crash the app
  }
}

export function trackHabitCreated(habitId: string, timeOfDay: string): void {
  captureEvent('habit_created', { habit_id: habitId, time_of_day: timeOfDay })
}

export function trackHabitCompleted(habitId: string, streak: number): void {
  captureEvent('habit_completed', { habit_id: habitId, streak })
}

export function trackStreakMilestone(habitId: string, streak: number): void {
  captureEvent('streak_milestone', { habit_id: habitId, streak })
}

export function trackOnboardingCompleted(): void {
  captureEvent('onboarding_completed')
}
