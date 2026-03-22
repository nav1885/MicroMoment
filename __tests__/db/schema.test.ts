/**
 * DB Schema tests — verifies initialiseDatabase runs without errors.
 * expo-sqlite and expo-crypto are auto-mocked via __mocks__/ directory.
 */
import { initialiseDatabase, closeDatabase } from '../../db/schema'
import * as SQLite from 'expo-sqlite'

const mockOpenDatabase = SQLite.openDatabaseAsync as jest.Mock
const mockDb = {
  execAsync: jest.fn().mockResolvedValue(undefined),
  runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
  getAllAsync: jest.fn().mockResolvedValue([]),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  withTransactionAsync: jest.fn().mockImplementation(async (fn: () => Promise<void>) => fn()),
}

beforeEach(() => {
  jest.clearAllMocks()
  closeDatabase()
  mockOpenDatabase.mockResolvedValue(mockDb)
})

describe('initialiseDatabase', () => {
  it('executes CREATE TABLE statements without error', async () => {
    await initialiseDatabase(mockDb as any)
    expect(mockDb.execAsync).toHaveBeenCalledTimes(1)
    const sql = mockDb.execAsync.mock.calls[0][0] as string
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS habits')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS completions')
  })

  it('enables WAL journal mode and foreign keys', async () => {
    await initialiseDatabase(mockDb as any)
    const sql = mockDb.execAsync.mock.calls[0][0] as string
    expect(sql).toContain('PRAGMA journal_mode = WAL')
    expect(sql).toContain('PRAGMA foreign_keys = ON')
  })

  it('creates performance indexes', async () => {
    await initialiseDatabase(mockDb as any)
    const sql = mockDb.execAsync.mock.calls[0][0] as string
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_completions_habit_id')
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_completions_date')
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_habits_active')
  })

  it('habits schema has required CHECK constraint fields', async () => {
    await initialiseDatabase(mockDb as any)
    const sql = mockDb.execAsync.mock.calls[0][0] as string
    expect(sql).toContain("CHECK(time_estimate_min BETWEEN 1 AND 5)")
    expect(sql).toContain("CHECK(time_of_day IN ('morning','afternoon','evening'))")
  })

  it('completions schema has ON DELETE CASCADE for habit_id', async () => {
    await initialiseDatabase(mockDb as any)
    const sql = mockDb.execAsync.mock.calls[0][0] as string
    expect(sql).toContain('ON DELETE CASCADE')
  })
})
