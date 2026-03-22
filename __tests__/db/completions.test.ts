/**
 * Completions DB layer tests.
 * expo-sqlite and expo-crypto are auto-mocked via __mocks__/ directory.
 */
import { closeDatabase } from '../../db/schema'
import {
  insertCompletion,
  getTodayCompletions,
  getCompletionsForHabit,
  getCompletionsByDateRange,
  hasCompletionToday,
} from '../../db/completions'
import * as SQLite from 'expo-sqlite'

const mockOpenDatabase = SQLite.openDatabaseAsync as jest.Mock

const mockDb = {
  execAsync: jest.fn().mockResolvedValue(undefined),
  runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
  getAllAsync: jest.fn().mockResolvedValue([]),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  withTransactionAsync: jest.fn().mockImplementation(async (fn: () => Promise<void>) => fn()),
}

const TODAY = new Date()
const TODAY_STR = `${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, '0')}-${String(TODAY.getDate()).padStart(2, '0')}`

beforeEach(() => {
  jest.clearAllMocks()
  closeDatabase()
  mockOpenDatabase.mockResolvedValue(mockDb)
})

describe('insertCompletion', () => {
  it('inserts with correct fields and returns completion object', async () => {
    const result = await insertCompletion({ habit_id: 'habit-1' })
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO completions'),
      expect.arrayContaining(['test-uuid-1234-5678-abcd', 'habit-1', TODAY_STR])
    )
    expect(result.habit_id).toBe('habit-1')
    expect(result.completed_date).toBe(TODAY_STR)
    expect(result.grace_used).toBe(0)
    expect(result.note).toBeNull()
  })

  it('sets grace_used = 1 when grace flag is true', async () => {
    const result = await insertCompletion({ habit_id: 'habit-1', grace_used: true })
    expect(result.grace_used).toBe(1)
  })

  it('stores note when provided', async () => {
    const result = await insertCompletion({ habit_id: 'habit-1', note: 'felt great' })
    expect(result.note).toBe('felt great')
  })
})

describe('getTodayCompletions', () => {
  it('queries with today date string', async () => {
    mockDb.getAllAsync.mockResolvedValueOnce([])
    await getTodayCompletions()
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('completed_date = ?'),
      [TODAY_STR]
    )
  })
})

describe('getCompletionsForHabit', () => {
  it('queries by habit_id ordered DESC', async () => {
    mockDb.getAllAsync.mockResolvedValueOnce([])
    await getCompletionsForHabit('habit-123')
    const [sql, params] = mockDb.getAllAsync.mock.calls[0]
    expect(sql).toContain('habit_id = ?')
    expect(sql).toContain('ORDER BY completed_date DESC')
    expect(params).toEqual(['habit-123'])
  })
})

describe('getCompletionsByDateRange', () => {
  it('queries with correct date range', async () => {
    mockDb.getAllAsync.mockResolvedValueOnce([])
    await getCompletionsByDateRange('2026-01-01', '2026-03-22')
    const [sql, params] = mockDb.getAllAsync.mock.calls[0]
    expect(sql).toContain('completed_date >= ?')
    expect(sql).toContain('completed_date <= ?')
    expect(params).toEqual(['2026-01-01', '2026-03-22'])
  })
})

describe('hasCompletionToday', () => {
  it('returns false when count is 0', async () => {
    mockDb.getFirstAsync.mockResolvedValueOnce({ count: 0 })
    expect(await hasCompletionToday('habit-1')).toBe(false)
  })

  it('returns true when count >= 1', async () => {
    mockDb.getFirstAsync.mockResolvedValueOnce({ count: 1 })
    expect(await hasCompletionToday('habit-1')).toBe(true)
  })

  it('queries with today date and habit id', async () => {
    mockDb.getFirstAsync.mockResolvedValueOnce({ count: 0 })
    await hasCompletionToday('habit-abc')
    const [sql, params] = mockDb.getFirstAsync.mock.calls[0]
    expect(sql).toContain('habit_id = ?')
    expect(sql).toContain('completed_date = ?')
    expect(params).toEqual(['habit-abc', TODAY_STR])
  })
})
