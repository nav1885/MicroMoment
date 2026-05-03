export const getPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' })
export const requestPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' })
export const scheduleNotificationAsync = jest.fn().mockResolvedValue('notification-id')
export const cancelScheduledNotificationAsync = jest.fn().mockResolvedValue(undefined)
export const cancelAllScheduledNotificationsAsync = jest.fn().mockResolvedValue(undefined)
export const getAllScheduledNotificationsAsync = jest.fn().mockResolvedValue([])
export const setNotificationChannelAsync = jest.fn().mockResolvedValue(undefined)
export const setNotificationHandler = jest.fn()

export const AndroidImportance = {
  MIN: 1,
  LOW: 2,
  DEFAULT: 3,
  HIGH: 4,
  MAX: 5,
} as const

export enum SchedulableTriggerInputTypes {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CALENDAR = 'calendar',
  DATE = 'date',
  TIME_INTERVAL = 'timeInterval',
}
