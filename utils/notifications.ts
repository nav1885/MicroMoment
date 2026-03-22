import * as Notifications from 'expo-notifications'
import { SchedulableTriggerInputTypes } from 'expo-notifications'
import type { NotificationTimes } from '../store/habitStore'
import type { Habit } from '../db/habits'

type TimeGroup = 'morning' | 'afternoon' | 'evening'

const NOTIFICATION_IDS: Record<TimeGroup, string> = {
  morning: 'habit-reminder-morning',
  afternoon: 'habit-reminder-afternoon',
  evening: 'habit-reminder-evening',
}

// Set up how notifications are displayed while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return true
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

/**
 * Cancel existing group reminders and schedule fresh ones based on the
 * current notification times and active habits list.
 *
 * Only groups with at least one active habit receive a notification.
 */
export async function scheduleHabitReminders(
  times: NotificationTimes,
  habits: Habit[]
): Promise<void> {
  // Cancel all three group reminders first
  await Promise.allSettled(
    Object.values(NOTIFICATION_IDS).map((id) =>
      Notifications.cancelScheduledNotificationAsync(id)
    )
  )

  const groups: TimeGroup[] = ['morning', 'afternoon', 'evening']

  for (const group of groups) {
    const groupHabits = habits.filter((h) => h.time_of_day === group)
    if (groupHabits.length === 0) continue

    const [hourStr, minuteStr] = times[group].split(':')
    const hour = parseInt(hourStr, 10)
    const minute = parseInt(minuteStr, 10)

    const body =
      groupHabits.length === 1
        ? `${groupHabits[0].emoji} ${groupHabits[0].name}`
        : `${groupHabits.map((h) => h.emoji).join('')} ${groupHabits.length} habits ready`

    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_IDS[group],
      content: {
        title: `Your ${group} micro-moment`,
        body,
        sound: true,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    })
  }
}

export async function cancelAllHabitReminders(): Promise<void> {
  await Promise.allSettled(
    Object.values(NOTIFICATION_IDS).map((id) =>
      Notifications.cancelScheduledNotificationAsync(id)
    )
  )
}
