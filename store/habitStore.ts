import { create } from 'zustand'
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
  getCompletionsForHabit,
} from '../db/completions'
import { calculateStreak } from '../utils/streakCalculator'
import {
  scheduleHabitNotification,
  cancelHabitNotification,
} from '../utils/notifications'

export const MAX_HABITS = 5

export interface HabitStore {
  habits: Habit[]
  todayCompletions: Completion[]
  streaks: Record<string, number>
  isLoading: boolean

  loadHabits: () => Promise<void>
  loadTodayCompletions: () => Promise<void>
  loadStreaks: () => Promise<void>
  getHabitStreak: (habitId: string) => Promise<number>
  createHabit: (input: CreateHabitInput) => Promise<void>
  updateHabit: (id: string, input: Partial<CreateHabitInput>) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
  archiveHabit: (id: string) => Promise<void>
  restoreHabit: (id: string) => Promise<void>
  reorderHabits: (orderedIds: string[]) => Promise<void>
  markComplete: (habitId: string, note?: string) => Promise<void>
  getArchivedHabits: () => Promise<Habit[]>
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  todayCompletions: [],
  streaks: {},
  isLoading: false,

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

  loadStreaks: async () => {
    const { habits } = get()
    try {
      const entries = await Promise.all(
        habits.map(async (h) => {
          const completions = await getCompletionsForHabit(h.id)
          const dates = completions.map((c) => c.completed_date)
          const { currentStreak } = calculateStreak(dates)
          return [h.id, currentStreak] as const
        })
      )
      set({ streaks: Object.fromEntries(entries) })
    } catch (err) {
      console.error('[habitStore] loadStreaks error:', err)
    }
  },

  getHabitStreak: async (habitId: string): Promise<number> => {
    const completions = await getCompletionsForHabit(habitId)
    const dates = completions.map((c) => c.completed_date)
    const { currentStreak } = calculateStreak(dates)
    return currentStreak
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
    scheduleHabitNotification(newHabit)
  },

  updateHabit: async (id: string, input: Partial<CreateHabitInput>) => {
    if (
      input.time_estimate_min !== undefined &&
      (input.time_estimate_min < 1 || input.time_estimate_min > 5)
    ) {
      throw new Error('Time estimate must be between 1 and 5 minutes.')
    }

    await updateHabit(id, input)
    const { habits } = get()
    const existing = habits.find((h) => h.id === id)
    if (existing) {
      scheduleHabitNotification({ ...existing, ...input } as Habit)
    }
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === id ? { ...h, ...input } : h
      ),
    }))
  },

  deleteHabit: async (id: string) => {
    await deleteHabit(id)
    cancelHabitNotification(id)
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== id),
      todayCompletions: state.todayCompletions.filter((c) => c.habit_id !== id),
    }))
  },

  archiveHabit: async (id: string) => {
    await archiveHabit(id)
    cancelHabitNotification(id)
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

  getArchivedHabits: async () => {
    return getAllArchivedHabits()
  },
}))
