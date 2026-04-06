import * as Crypto from 'expo-crypto'
import { getDatabase } from './schema'

export interface Habit {
  id: string
  name: string
  emoji: string
  time_estimate_min: number
  time_of_day: 'morning' | 'afternoon' | 'evening'
  sort_order: number
  is_active: number
  created_at: string
  reminder_time: string | null
  reminder_offset_min: number | null
}

export interface CreateHabitInput {
  name: string
  emoji: string
  time_estimate_min: number
  time_of_day: 'morning' | 'afternoon' | 'evening'
  reminder_time?: string | null
  reminder_offset_min?: number | null
}

export async function insertHabit(input: CreateHabitInput, sortOrder: number): Promise<Habit> {
  const db = await getDatabase()
  const id = Crypto.randomUUID()
  const created_at = new Date().toISOString()

  const reminderTime = input.reminder_time ?? null
  const reminderOffsetMin = input.reminder_offset_min ?? null

  await db.runAsync(
    `INSERT INTO habits (id, name, emoji, time_estimate_min, time_of_day, sort_order, is_active, created_at, reminder_time, reminder_offset_min)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
    [id, input.name, input.emoji, input.time_estimate_min, input.time_of_day, sortOrder, created_at, reminderTime, reminderOffsetMin]
  )

  return {
    id,
    name: input.name,
    emoji: input.emoji,
    time_estimate_min: input.time_estimate_min,
    time_of_day: input.time_of_day,
    sort_order: sortOrder,
    is_active: 1,
    created_at,
    reminder_time: reminderTime,
    reminder_offset_min: reminderOffsetMin,
  }
}

export async function updateHabit(id: string, input: Partial<CreateHabitInput>): Promise<void> {
  const db = await getDatabase()
  const fields: string[] = []
  const values: (string | number)[] = []

  if (input.name !== undefined) { fields.push('name = ?'); values.push(input.name) }
  if (input.emoji !== undefined) { fields.push('emoji = ?'); values.push(input.emoji) }
  if (input.time_estimate_min !== undefined) { fields.push('time_estimate_min = ?'); values.push(input.time_estimate_min) }
  if (input.time_of_day !== undefined) { fields.push('time_of_day = ?'); values.push(input.time_of_day) }
  if ('reminder_time' in input) { fields.push('reminder_time = ?'); values.push(input.reminder_time ?? null as any) }
  if ('reminder_offset_min' in input) { fields.push('reminder_offset_min = ?'); values.push(input.reminder_offset_min ?? null as any) }

  if (fields.length === 0) return
  values.push(id)

  await db.runAsync(`UPDATE habits SET ${fields.join(', ')} WHERE id = ?`, values)
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDatabase()
  await db.runAsync('DELETE FROM habits WHERE id = ?', [id])
}

export async function archiveHabit(id: string): Promise<void> {
  const db = await getDatabase()
  await db.runAsync('UPDATE habits SET is_active = 0 WHERE id = ?', [id])
}

export async function restoreHabit(id: string): Promise<void> {
  const db = await getDatabase()
  await db.runAsync('UPDATE habits SET is_active = 1 WHERE id = ?', [id])
}

export async function getAllActiveHabits(): Promise<Habit[]> {
  const db = await getDatabase()
  return db.getAllAsync<Habit>(
    'SELECT * FROM habits WHERE is_active = 1 ORDER BY sort_order ASC'
  )
}

export async function getAllArchivedHabits(): Promise<Habit[]> {
  const db = await getDatabase()
  return db.getAllAsync<Habit>(
    'SELECT * FROM habits WHERE is_active = 0 ORDER BY created_at DESC'
  )
}

export async function getHabitById(id: string): Promise<Habit | null> {
  const db = await getDatabase()
  return db.getFirstAsync<Habit>('SELECT * FROM habits WHERE id = ?', [id])
}

export async function reorderHabits(orderedIds: string[]): Promise<void> {
  const db = await getDatabase()
  await db.withTransactionAsync(async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.runAsync('UPDATE habits SET sort_order = ? WHERE id = ?', [i, orderedIds[i]])
    }
  })
}

export async function countActiveHabits(): Promise<number> {
  const db = await getDatabase()
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM habits WHERE is_active = 1'
  )
  return result?.count ?? 0
}
