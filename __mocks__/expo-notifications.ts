export const getPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' })
export const requestPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' })
export const scheduleNotificationAsync = jest.fn().mockResolvedValue('notification-id')
export const cancelScheduledNotificationAsync = jest.fn().mockResolvedValue(undefined)
export const setNotificationHandler = jest.fn()

export enum SchedulableTriggerInputTypes {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CALENDAR = 'calendar',
  DATE = 'date',
  TIME_INTERVAL = 'timeInterval',
}
