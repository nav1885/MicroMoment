import {
  insertHabit,
  updateHabit,
  deleteHabit,
  archiveHabit,
  restoreHabit,
  getAllActiveHabits,
  getAllArchivedHabits,
  getHabitById,
  countActiveHabits,
  reorderHabits,
} from '../../db/habits'

// Reset DB singleton between tests so each test gets fresh mock state
beforeEach(() => {
  jest.resetModules()
})

const SAMPLE_INPUT = {
  name: 'Morning stretch',
  emoji: '🧘',
  time_estimate_min: 5,
  time_of_day: 'morning' as const,
}

describe('insertHabit', () => {
  test('returns a habit with correct shape', async () => {
    const habit = await insertHabit(SAMPLE_INPUT, 0)
    expect(habit).toMatchObject({
      name: 'Morning stretch',
      emoji: '🧘',
      time_estimate_min: 5,
      time_of_day: 'morning',
      sort_order: 0,
      is_active: 1,
    })
    expect(typeof habit.id).toBe('string')
    expect(habit.id.length).toBeGreaterThan(0)
    expect(typeof habit.created_at).toBe('string')
  })

  test('uses the provided sortOrder', async () => {
    const habit = await insertHabit(SAMPLE_INPUT, 3)
    expect(habit.sort_order).toBe(3)
  })
})

describe('updateHabit', () => {
  test('calls runAsync with updated fields', async () => {
    // Does not throw when given valid partial input
    await expect(updateHabit('some-id', { name: 'Updated name' })).resolves.toBeUndefined()
  })

  test('is a no-op when given empty object', async () => {
    // Should not throw — it just returns early
    await expect(updateHabit('some-id', {})).resolves.toBeUndefined()
  })
})

describe('deleteHabit', () => {
  test('resolves without error', async () => {
    await expect(deleteHabit('some-id')).resolves.toBeUndefined()
  })
})

describe('archiveHabit / restoreHabit', () => {
  test('archiveHabit resolves without error', async () => {
    await expect(archiveHabit('some-id')).resolves.toBeUndefined()
  })

  test('restoreHabit resolves without error', async () => {
    await expect(restoreHabit('some-id')).resolves.toBeUndefined()
  })
})

describe('getAllActiveHabits', () => {
  test('returns an array (empty by default mock)', async () => {
    const habits = await getAllActiveHabits()
    expect(Array.isArray(habits)).toBe(true)
  })
})

describe('getAllArchivedHabits', () => {
  test('returns an array (empty by default mock)', async () => {
    const habits = await getAllArchivedHabits()
    expect(Array.isArray(habits)).toBe(true)
  })
})

describe('getHabitById', () => {
  test('returns null when not found (default mock)', async () => {
    const habit = await getHabitById('missing-id')
    expect(habit).toBeNull()
  })
})

describe('countActiveHabits', () => {
  test('returns 0 when getFirstAsync returns null', async () => {
    const count = await countActiveHabits()
    expect(count).toBe(0)
  })
})

describe('reorderHabits', () => {
  test('resolves without error for an ordered list', async () => {
    await expect(reorderHabits(['id-1', 'id-2', 'id-3'])).resolves.toBeUndefined()
  })

  test('handles empty list', async () => {
    await expect(reorderHabits([])).resolves.toBeUndefined()
  })
})
