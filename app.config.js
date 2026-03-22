export default ({ config }) => ({
  ...config,
  name: 'MicroMoment: 5-Min Habit Tracker',
  slug: 'micromoment',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#FAFAFA',
  },
  ios: {
    supportsTablet: false,
    requireFullScreen: true,
    bundleIdentifier: 'com.nav1885.micromoment',
    deploymentTarget: '16.0',
  },
  android: {
    package: 'com.nav1885.micromoment',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#4F7942',
    },
    minSdkVersion: 26,
    targetSdkVersion: 34,
    compileSdkVersion: 34,
  },
  extra: {
    sentryDsn: process.env.SENTRY_DSN ?? '',
    posthogApiKey: process.env.POSTHOG_API_KEY ?? '',
    posthogHost: process.env.POSTHOG_HOST ?? 'https://app.posthog.com',
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    [
      'expo-notifications',
      {
        icon: './assets/icon.png',
        color: '#4F7942',
      },
    ],
  ],
  scheme: 'micromoment',
  experiments: {
    typedRoutes: true,
  },
})
