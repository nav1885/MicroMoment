import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  Habit,
  CreateHabitInput,
  insertHabit,
  updateHabit,
  deleteHabit,
  archiveHabit,
  restoreHabit,
  getAllActiveHabits,
  getAllArchivedHabits,
  countActiveHabits,
  reorderHabits,
} from '../db/habits'
import {
  Completion,
  insertCompletion,
  getTodayCompletions,
  hasCompletionToday,
} from '../db/completions'

export const MAX_HABITS = 5
const NOTIFY_MORNING_KEY = 'notify_morning'
const NOTIFY_AFTERNOON_KEY = 'notify_afternoon'
const NOTIFY_EVENING_KEY = 'notify_evening'

export interface NotificationTimes {
  morning: string
  afternoon: string
  evening: string
}

const DEFAULT_NOTIFICATION_TIMES: NotificationTimes = {
  morning: '07:00',
  afternoon: '12:00',
  evening: '19:00',
}

export interface HabitStore {
  habits: Habit[]
  todayCompletions: Completion[]
  isLoading: boolean
  notificationTimes: NotificationTimes

  loadHabits: () => Promise<void>
  loadTodayCompletions: () => Promise<void>
  createHabit: (input: CreateHabitInput) => Promise<void>
  updateHabit: (id: string, input: Partial<CreateHabitInput>) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
  archiveHabit: (id: string) => Promise<void>
  restoreHabit: (id: string) => Promise<void>
  reorderHabits: (orderedIds: string[]) => Promise<void>
  markComplete: (habitId: string, note?: string) => Promise<void>
  loadNotificationTimes: () => Promise<void>
  saveNotificationTimes: (times: Partial<NotificationTimes>) => Promise<void>
  getArchivedHabits: () => Promise<Habit[]>
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  todayCompletions: [],
  isLoading: false,
  notificationTimes: { ...DEFAULT_NOTIFICATION_TIMES },

  loadHabits: async () => {
    set({ isLoading: true })
    try {
      const habits = await getAllActiveHabits()
      set({ habits, isLoading: false })
    } catch (err) {
      console.error('[habitStore] loadHabits error:', err)
      set({ isLoading: false })
    }
  },

  loadTodayCompletions: async () => {
    try {
      const todayCompletions = await getTodayCompletions()
      set({ todayCompletions })
    } catch (err) {
      console.error('[habitStore] loadTodayCompletions error:', err)
    }
  },

  createHabit: async (input: CreateHabitInput) => {
    const { habits } = get()

    if (habits.length >= MAX_HABITS) {
      throw new Error(
        'You have reached the 5-habit limit. Focus on mastering these first.'
      )
    }

    if (input.time_estimate_min < 1 || input.time_estimate_min > 5) {
      throw new Error('Time estimate must be between 1 and 5 minutes.')
    }

    if (!input.name.trim()) {
      throw new Error('Habit name cannot be empty.')
    }

    const sortOrder = habits.length
    const newHabit = await insertHabit(input, sortOrder)
    set({ habits: [...habits, newHabit] })
  },

  updateHabit: async (id: string, input: Partial<CreateHabitInput>) => {
    if (
      input.time_estimate_min !== undefined &&
      (input.time_estimate_min < 1 || input.time_estimate_min > 5)
    ) {
      throw new Error('Time estimate must be between 1 and 5 minutes.')
    }

    await updateHabit(id, input)
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === id ? { ...h, ...input } : h
      ),
    }))
  },

  deleteHabit: async (id: string) => {
    await deleteHabit(id)
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== id),
      todayCompletions: state.todayCompletions.filter((c) => c.habit_id !== id),
    }))
  },

  archiveHabit: async (id: string) => {
    await archiveHabit(id)
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== id),
      todayCompletions: state.todayCompletions.filter((c) => c.habit_id !== id),
    }))
  },

  restoreHabit: async (id: string) => {
    const { habits } = get()
    if (habits.length >= MAX_HABITS) {
      throw new Error(
        'You have 5 active habits. Archive one before restoring another.'
      )
    }
    await restoreHabit(id)
    await get().loadHabits()
  },

  reorderHabits: async (orderedIds: string[]) => {
    await reorderHabits(orderedIds)
    set((state) => {
      const habitMap = new Map(state.habits.map((h) => [h.id, h]))
      const reordered = orderedIds
        .map((id, idx) => {
          const h = habitMap.get(id)
          return h ? { ...h, sort_order: idx } : null
        })
        .filter((h): h is Habit => h !== null)
      return { habits: reordered }
    })
  },

  markComplete: async (habitId: string, note?: string) => {
    const alreadyDone = await hasCompletionToday(habitId)
    if (alreadyDone) {
      throw new Error('Habit already completed today.')
    }

    const completion = await insertCompletion({ habit_id: habitId, note })
    set((state) => ({
      todayCompletions: [...state.todayCompletions, completion],
    }))
  },

  loadNotificationTimes: async () => {
    try {
      const [morning, afternoon, evening] = await Promise.all([
        AsyncStorage.getItem(NOTIFY_MORNING_KEY),
        AsyncStorage.getItem(NOTIFY_AFTERNOON_KEY),
        AsyncStorage.getItem(NOTIFY_EVENING_KEY),
      ])
      set({
        notificationTimes: {
          morning: morning ?? DEFAULT_NOTIFICATION_TIMES.morning,
          afternoon: afternoon ?? DEFAULT_NOTIFICATION_TIMES.afternoon,
          evening: evening ?? DEFAULT_NOTIFICATION_TIMES.evening,
        },
      })
    } catch (err) {
      console.error('[habitStore] loadNotificationTimes error:', err)
    }
  },

  saveNotificationTimes: async (times: Partial<NotificationTimes>) => {
    const current = get().notificationTimes
    const updated = { ...current, ...times }

    await Promise.all([
      times.morning !== undefined
        ? AsyncStorage.setItem(NOTIFY_MORNING_KEY, updated.morning)
        : Promise.resolve(),
      times.afternoon !== undefined
        ? AsyncStorage.setItem(NOTIFY_AFTERNOON_KEY, updated.afternoon)
        : Promise.resolve(),
      times.evening !== undefined
        ? AsyncStorage.setItem(NOTIFY_EVENING_KEY, updated.evening)
        : Promise.resolve(),
    ])

    set({ notificationTimes: updated })
  },

  getArchivedHabits: async () => {
    return getAllArchivedHabits()
  },
}))
