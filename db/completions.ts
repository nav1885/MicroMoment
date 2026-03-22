import * as Crypto from 'expo-crypto'
import { getDatabase } from './schema'

export interface Completion {
  id: string
  habit_id: string
  completed_date: string
  completed_at: string
  note: string | null
  grace_used: number
}

export interface InsertCompletionInput {
  habit_id: string
  note?: string
  grace_used?: boolean
}

function getTodayDateString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export async function insertCompletion(input: InsertCompletionInput): Promise<Completion> {
  const db = await getDatabase()
  const id = Crypto.randomUUID()
  const completed_date = getTodayDateString()
  const completed_at = new Date().toISOString()
  const grace_used = input.grace_used ? 1 : 0
  const note = input.note ?? null

  await db.runAsync(
    `INSERT INTO completions (id, habit_id, completed_date, completed_at, note, grace_used)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, input.habit_id, completed_date, completed_at, note, grace_used]
  )

  return { id, habit_id: input.habit_id, completed_date, completed_at, note, grace_used }
}

export async function getTodayCompletions(): Promise<Completion[]> {
  const db = await getDatabase()
  const today = getTodayDateString()
  return db.getAllAsync<Completion>(
    'SELECT * FROM completions WHERE completed_date = ?',
    [today]
  )
}

export async function getCompletionsForHabit(habitId: string): Promise<Completion[]> {
  const db = await getDatabase()
  return db.getAllAsync<Completion>(
    'SELECT * FROM completions WHERE habit_id = ? ORDER BY completed_date DESC',
    [habitId]
  )
}

export async function getCompletionsByDateRange(
  startDate: string,
  endDate: string
): Promise<Completion[]> {
  const db = await getDatabase()
  return db.getAllAsync<Completion>(
    'SELECT * FROM completions WHERE completed_date >= ? AND completed_date <= ? ORDER BY completed_date ASC',
    [startDate, endDate]
  )
}

export async function hasCompletionToday(habitId: string): Promise<boolean> {
  const db = await getDatabase()
  const today = getTodayDateString()
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM completions WHERE habit_id = ? AND completed_date = ?',
    [habitId, today]
  )
  return (result?.count ?? 0) > 0
}
