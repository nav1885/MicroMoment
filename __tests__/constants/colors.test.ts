import { Colors } from '../../constants/colors'

const REQUIRED_TOKENS = [
  'background', 'surface', 'text', 'textSecondary',
  'primary', 'primaryLight', 'border',
  'cardBackground', 'completedCard', 'completedText',
  'amber', 'streak', 'danger',
  'sectionHeader', 'checkActive', 'checkInactive',
  'ringBackground', 'ringFill',
  'heatmap0', 'heatmap1', 'heatmap2', 'heatmap3', 'heatmap4',
] as const

describe('Colors token contract', () => {
  for (const token of REQUIRED_TOKENS) {
    test(`light theme has "${token}"`, () => {
      expect(Colors.light[token]).toBeDefined()
      expect(typeof Colors.light[token]).toBe('string')
      expect(Colors.light[token].length).toBeGreaterThan(0)
    })

    test(`dark theme has "${token}"`, () => {
      expect(Colors.dark[token]).toBeDefined()
      expect(typeof Colors.dark[token]).toBe('string')
      expect(Colors.dark[token].length).toBeGreaterThan(0)
    })
  }

  test('light and dark themes have the same set of tokens', () => {
    const lightKeys = Object.keys(Colors.light).sort()
    const darkKeys = Object.keys(Colors.dark).sort()
    expect(lightKeys).toEqual(darkKeys)
  })

  test('streak token is the amber/orange value', () => {
    expect(Colors.light.streak).toBe('#FF9F0A')
    expect(Colors.dark.streak).toBe('#FF9F0A')
  })

  test('danger token is iOS red', () => {
    expect(Colors.light.danger).toBe('#FF3B30')
    expect(Colors.dark.danger).toBe('#FF3B30')
  })

  test('primary is the new brighter green', () => {
    expect(Colors.light.primary).toBe('#34A853')
  })

  test('heatmap scale has 5 distinct stops', () => {
    const stops = [Colors.light.heatmap0, Colors.light.heatmap1, Colors.light.heatmap2, Colors.light.heatmap3, Colors.light.heatmap4]
    const unique = new Set(stops)
    expect(unique.size).toBe(5)
  })
})
