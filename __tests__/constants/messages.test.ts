import { DAILY_MESSAGES, getDailyMessage } from '../../constants/messages'

describe('DAILY_MESSAGES', () => {
  test('contains at least 300 entries', () => {
    expect(DAILY_MESSAGES.length).toBeGreaterThanOrEqual(300)
  })

  test('all entries are non-empty strings', () => {
    for (const msg of DAILY_MESSAGES) {
      expect(typeof msg).toBe('string')
      expect(msg.trim().length).toBeGreaterThan(0)
    }
  })

  test('no duplicate messages', () => {
    const unique = new Set(DAILY_MESSAGES)
    expect(unique.size).toBe(DAILY_MESSAGES.length)
  })
})

describe('getDailyMessage', () => {
  test('returns a string', () => {
    const msg = getDailyMessage()
    expect(typeof msg).toBe('string')
    expect(msg.length).toBeGreaterThan(0)
  })

  test('returned message is in DAILY_MESSAGES', () => {
    const msg = getDailyMessage()
    expect(DAILY_MESSAGES).toContain(msg)
  })
})
