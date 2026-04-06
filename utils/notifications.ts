import * as Notifications from 'expo-notifications'
import { SchedulableTriggerInputTypes } from 'expo-notifications'
import type { Habit } from '../db/habits'

// Set up how notifications are displayed while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

// Android 8+ requires a notification channel or notifications are silently dropped.
export async function setupNotificationChannel(): Promise<void> {
  if (process.env.EXPO_OS === 'android') {
    await Notifications.setNotificationChannelAsync('habit-reminders', {
      name: 'Habit Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    })
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return true
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

function notificationId(habitId: string): string {
  return `habit-reminder-${habitId}`
}

export async function scheduleHabitNotification(habit: Habit): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId(habit.id))

  if (!habit.reminder_time) return

  const [hourStr, minuteStr] = habit.reminder_time.split(':')
  const totalMinutes = parseInt(hourStr, 10) * 60 + parseInt(minuteStr, 10) - (habit.reminder_offset_min ?? 0)
  const clamped = Math.max(0, totalMinutes)
  const hour = Math.floor(clamped / 60)
  const minute = clamped % 60

  const offsetLabel = habit.reminder_offset_min
    ? ` (${habit.reminder_offset_min < 60 ? `${habit.reminder_offset_min} min` : `${habit.reminder_offset_min / 60} hr`} heads-up)`
    : ''

  await Notifications.scheduleNotificationAsync({
    identifier: notificationId(habit.id),
    content: {
      title: `Time for your micro-moment${offsetLabel}`,
      body: `${habit.emoji} ${habit.name}`,
      sound: true,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: 'habit-reminders',
    },
  })
}

export async function cancelHabitNotification(habitId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId(habitId))
}

export async function rescheduleAllNotifications(habits: Habit[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync()
  await Promise.allSettled(habits.map(scheduleHabitNotification))
}
