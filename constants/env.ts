import Constants from 'expo-constants'

export const ENV = {
  sentryDsn: (Constants.expoConfig?.extra?.sentryDsn as string) ?? '',
  posthogApiKey: (Constants.expoConfig?.extra?.posthogApiKey as string) ?? '',
  posthogHost: (Constants.expoConfig?.extra?.posthogHost as string) ?? 'https://app.posthog.com',
}
