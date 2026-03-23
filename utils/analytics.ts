import * as Sentry from '@sentry/react-native'
import { PostHog } from 'posthog-react-native'
import Constants from 'expo-constants'

let posthog: PostHog | null = null

/**
 * Initialise error reporting and product analytics.
 * Safe to call multiple times — subsequent calls are no-ops.
 *
 * Both integrations require EAS secrets (SENTRY_DSN / POSTHOG_API_KEY)
 * to be set at build time. When running in development without secrets,
 * the calls are silently skipped.
 */
export function initAnalytics(): void {
  const extra = Constants.expoConfig?.extra as Record<string, string> | undefined
  const sentryDsn: string = extra?.sentryDsn ?? ''
  const posthogKey: string = extra?.posthogApiKey ?? ''
  const posthogHost: string = extra?.posthogHost ?? 'https://app.posthog.com'

  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      enableAutoSessionTracking: true,
      tracesSampleRate: 0.2,
    })
  }

  if (posthogKey && !posthog) {
    posthog = new PostHog(posthogKey, { host: posthogHost })
  }
}

export function captureEvent(event: string, properties?: Record<string, string | number | boolean | null>): void {
  try {
    posthog?.capture(event, properties)
  } catch {
    // Analytics must never crash the app
  }
}

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  try {
    if (context) {
      Sentry.withScope((scope) => {
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

// ── Named event helpers ──────────────────────────────────────────────────────

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
