import { useEffect } from 'react'
import { Stack, useRouter, useRootNavigationState } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { requestNotificationPermission } from '../utils/notifications'

const ONBOARDING_KEY = 'onboarding_complete'

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const router = useRouter()
  const rootState = useRootNavigationState()

  useEffect(() => {
    if (!rootState?.key) return
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      if (!value) {
        router.replace('/onboarding')
      }
    })
  }, [rootState?.key])

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="habit/[id]" options={{ presentation: 'card', headerShown: false }} />
        <Stack.Screen name="habit/new" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  )
}
