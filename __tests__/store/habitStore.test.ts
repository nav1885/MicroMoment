/**
 * Zustand habit store tests.
 * All DB and AsyncStorage calls are mocked.
 */

// Mock DB modules
jest.mock('../../db/habits', () => ({
  insertHabit: jest.fn(),
  updateHabit: jest.fn(),
  deleteHabit: jest.fn(),
  archiveHabit: jest.fn(),
  restoreHabit: jest.fn(),
  getAllActiveHabits: jest.fn().mockResolvedValue([]),
  getAllArchivedHabits: jest.fn().mockResolvedValue([]),
  countActiveHabits: jest.fn().mockResolvedValue(0),
  reorderHabits: jest.fn(),
}))

jest.mock('../../db/completions', () => ({
  insertCompletion: jest.fn(),
  getTodayCompletions: jest.fn().mockResolvedValue([]),
  hasCompletionToday: jest.fn().mockResolvedValue(false),
}))

jest.mock('@react-native-async-storage/async-storage', () =>
  require('../../__mocks__/async-storage')
)

import { useHabitStore, MAX_HABITS } from '../../store/habitStore'
import * as dbHabits from '../../db/habits'
import * as dbCompletions from '../../db/completions'
import type { Habit } from '../../db/habits'

const mockInsertHabit = dbHabits.insertHabit as jest.Mock
const mockUpdateHabit = dbHabits.updateHabit as jest.Mock
const mockDeleteHabit = dbHabits.deleteHabit as jest.Mock
const mockArchiveHabit = dbHabits.archiveHabit as jest.Mock
const mockRestoreHabit = dbHabits.restoreHabit as jest.Mock
const mockGetAllActiveHabits = dbHabits.getAllActiveHabits as jest.Mock
const mockReorderHabits = dbHabits.reorderHabits as jest.Mock
const mockInsertCompletion = dbCompletions.insertCompletion as jest.Mock
const mockGetTodayCompletions = dbCompletions.getTodayCompletions as jest.Mock
const mockHasCompletionToday = dbCompletions.hasCompletionToday as jest.Mock

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'habit-1',
    name: 'Meditate',
    emoji: '🧘',
    time_estimate_min: 5,
    time_of_day: 'morning',
    sort_order: 0,
    is_active: 1,
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  // Reset store to initial state
  useHabitStore.setState({
    habits: [],
    todayCompletions: [],
    isLoading: false,
    notificationTimes: { morning: '07:00', afternoon: '12:00', evening: '19:00' },
  })
  mockGetTodayCompletions.mockResolvedValue([])
  mockHasCompletionToday.mockResolvedValue(false)
})

describe('loadHabits', () => {
  it('populates habits from DB', async () => {
    const habits = [makeHabit()]
    mockGetAllActiveHabits.mockResolvedValue(habits)
    await useHabitStore.getState().loadHabits()
    expect(useHabitStore.getState().habits).toEqual(habits)
  })

  it('sets isLoading false after completion', async () => {
    mockGetAllActiveHabits.mockResolvedValue([])
    await useHabitStore.getState().loadHabits()
    expect(useHabitStore.getState().isLoading).toBe(false)
  })
})

describe('createHabit', () => {
  const validInput = {
    name: 'Meditate',
    emoji: '🧘',
    time_estimate_min: 5,
    time_of_day: 'morning' as const,
  }

  it('creates a habit and adds to state', async () => {
    const newHabit = makeHabit()
    mockInsertHabit.mockResolvedValue(newHabit)
    await useHabitStore.getState().createHabit(validInput)
    expect(useHabitStore.getState().habits).toContain(newHabit)
    expect(mockInsertHabit).toHaveBeenCalledWith(validInput, 0)
  })

  it('throws when 5 habits already exist', async () => {
    const fiveHabits = Array.from({ length: MAX_HABITS }, (_, i) =>
      makeHabit({ id: `habit-${i}` })
    )
    useHabitStore.setState({ habits: fiveHabits })
    await expect(useHabitStore.getState().createHabit(validInput)).rejects.toThrow(
      '5-habit limit'
    )
    expect(mockInsertHabit).not.toHaveBeenCalled()
  })

  it('throws when time_estimate_min = 6', async () => {
    await expect(
      useHabitStore.getState().createHabit({ ...validInput, time_estimate_min: 6 })
    ).rejects.toThrow('between 1 and 5')
    expect(mockInsertHabit).not.toHaveBeenCalled()
  })

  it('throws when time_estimate_min = 0', async () => {
    await expect(
      useHabitStore.getState().createHabit({ ...validInput, time_estimate_min: 0 })
    ).rejects.toThrow('between 1 and 5')
  })

  it('passes sort_order equal to current habit count', async () => {
    const existingHabit = makeHabit({ id: 'existing' })
    useHabitStore.setState({ habits: [existingHabit] })
    const newHabit = makeHabit({ id: 'new', sort_order: 1 })
    mockInsertHabit.mockResolvedValue(newHabit)
    await useHabitStore.getState().createHabit(validInput)
    expect(mockInsertHabit).toHaveBeenCalledWith(validInput, 1)
  })
})

describe('deleteHabit', () => {
  it('removes habit from state after DB delete', async () => {
    mockDeleteHabit.mockResolvedValue(undefined)
    useHabitStore.setState({ habits: [makeHabit({ id: 'habit-1' })] })
    await useHabitStore.getState().deleteHabit('habit-1')
    expect(useHabitStore.getState().habits).toHaveLength(0)
    expect(mockDeleteHabit).toHaveBeenCalledWith('habit-1')
  })
})

describe('archiveHabit', () => {
  it('removes habit from active list', async () => {
    mockArchiveHabit.mockResolvedValue(undefined)
    useHabitStore.setState({ habits: [makeHabit({ id: 'habit-1' })] })
    await useHabitStore.getState().archiveHabit('habit-1')
    expect(useHabitStore.getState().habits).toHaveLength(0)
    expect(mockArchiveHabit).toHaveBeenCalledWith('habit-1')
  })
})

describe('restoreHabit', () => {
  it('throws if already at 5 habits', async () => {
    const fiveHabits = Array.from({ length: MAX_HABITS }, (_, i) =>
      makeHabit({ id: `habit-${i}` })
    )
    useHabitStore.setState({ habits: fiveHabits })
    await expect(useHabitStore.getState().restoreHabit('archived-1')).rejects.toThrow(
      'Archive one before restoring'
    )
  })
})

describe('reorderHabits', () => {
  it('updates sort_order in state and calls DB', async () => {
    mockReorderHabits.mockResolvedValue(undefined)
    const h1 = makeHabit({ id: 'h1', sort_order: 0 })
    const h2 = makeHabit({ id: 'h2', sort_order: 1 })
    useHabitStore.setState({ habits: [h1, h2] })
    await useHabitStore.getState().reorderHabits(['h2', 'h1'])
    const { habits } = useHabitStore.getState()
    expect(habits[0].id).toBe('h2')
    expect(habits[0].sort_order).toBe(0)
    expect(habits[1].id).toBe('h1')
    expect(habits[1].sort_order).toBe(1)
    expect(mockReorderHabits).toHaveBeenCalledWith(['h2', 'h1'])
  })
})

describe('markComplete', () => {
  it('inserts completion and updates state', async () => {
    const completion = {
      id: 'c1',
      habit_id: 'habit-1',
      completed_date: '2026-03-22',
      completed_at: '2026-03-22T08:00:00Z',
      note: null,
      grace_used: 0,
    }
    mockHasCompletionToday.mockResolvedValue(false)
    mockInsertCompletion.mockResolvedValue(completion)
    await useHabitStore.getState().markComplete('habit-1')
    expect(useHabitStore.getState().todayCompletions).toContain(completion)
  })

  it('throws if habit already completed today', async () => {
    mockHasCompletionToday.mockResolvedValue(true)
    await expect(useHabitStore.getState().markComplete('habit-1')).rejects.toThrow(
      'already completed today'
    )
    expect(mockInsertCompletion).not.toHaveBeenCalled()
  })
})

describe('notification times', () => {
  it('loads defaults when AsyncStorage is empty', async () => {
    await useHabitStore.getState().loadNotificationTimes()
    expect(useHabitStore.getState().notificationTimes).toEqual({
      morning: '07:00',
      afternoon: '12:00',
      evening: '19:00',
    })
  })

  it('saves and retrieves custom notification times', async () => {
    await useHabitStore.getState().saveNotificationTimes({ morning: '06:30' })
    expect(useHabitStore.getState().notificationTimes.morning).toBe('06:30')
  })
})
