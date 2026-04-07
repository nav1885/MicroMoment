import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import { useHabitStore } from '../../store/habitStore'
import { getCompletionsByDateRange, getCompletionsForHabit } from '../../db/completions'
import { calculateStreak, StreakResult } from '../../utils/streakCalculator'
import { useThemeColors } from '../../hooks/useThemeColors'

const HEATMAP_DAYS = 56 // 8 weeks

function localDateString(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toLocaleDateString('en-CA') // YYYY-MM-DD
}

export default function ProgressScreen() {
  const colors = useThemeColors()
  const { habits, loadHabits, loadStreaks } = useHabitStore()

  const [heatmapData, setHeatmapData] = useState<Map<string, number>>(new Map())
  const [habitStats, setHabitStats] = useState<Record<string, StreakResult>>({})

  useFocusEffect(
    useCallback(() => {
      loadHabits()
      loadStreaks()
      loadScreenData()
    }, [])
  )

  const loadScreenData = async () => {
    const endDate = localDateString(0)
    const startDate = localDateString(HEATMAP_DAYS - 1)
    const rangeCompletions = await getCompletionsByDateRange(startDate, endDate)

    const map = new Map<string, number>()
    for (const c of rangeCompletions) {
      map.set(c.completed_date, (map.get(c.completed_date) ?? 0) + 1)
    }
    setHeatmapData(map)
  }

  const loadHabitStats = useCallback(async () => {
    if (habits.length === 0) return
    const entries = await Promise.all(
      habits.map(async (h) => {
        const completions = await getCompletionsForHabit(h.id)
        const dates = completions.map((c) => c.completed_date)
        return [h.id, calculateStreak(dates)] as const
      })
    )
    setHabitStats(Object.fromEntries(entries))
  }, [habits])

  React.useEffect(() => {
    loadHabitStats()
  }, [loadHabitStats])

  // ── Weekly row (last 7 days) ──
  const last7 = Array.from({ length: 7 }, (_, i) => localDateString(6 - i))
  const activeDaysThisWeek = last7.filter((d) => (heatmapData.get(d) ?? 0) > 0).length
  const dayLetters = last7.map((d) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(d).getDay()])

  // ── Heatmap grid (snapped to Monday) ──
  const todayForGrid = new Date()
  const dayOfWeek = todayForGrid.getDay()
  const daysSinceMonday = (dayOfWeek + 6) % 7
  const gridStart = new Date(todayForGrid)
  gridStart.setDate(gridStart.getDate() - daysSinceMonday - 7 * 7)
  gridStart.setHours(0, 0, 0, 0)

  const gridDates = Array.from({ length: HEATMAP_DAYS }, (_, i) => {
    const d = new Date(gridStart)
    d.setDate(d.getDate() + i)
    return d.toLocaleDateString('en-CA')
  })

  const weekLabels = Array.from({ length: HEATMAP_DAYS / 7 }, (_, week) => {
    const d = new Date(gridStart)
    d.setDate(d.getDate() + week * 7)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  const totalHabits = Math.max(habits.length, 1)

  const cellColor = (count: number): string => {
    if (count === 0) return colors.heatmap0
    const ratio = count / totalHabits
    if (ratio >= 1) return colors.heatmap4
    if (ratio >= 0.75) return colors.heatmap3
    if (ratio >= 0.5) return colors.heatmap2
    return colors.heatmap1
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>Progress</Text>

        {/* ── Last 7 days ── */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.cardBackground, shadowColor: colors.text },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.sectionHeader }]}>LAST 7 DAYS</Text>
          <View style={styles.weekRow}>
            {last7.map((date, i) => {
              const active = (heatmapData.get(date) ?? 0) > 0
              return (
                <View key={date} style={styles.dayCell}>
                  <View
                    style={[
                      styles.dayDot,
                      { backgroundColor: active ? colors.primary : colors.heatmap0 },
                    ]}
                    accessibilityLabel={`${date}: ${active ? 'active' : 'no activity'}`}
                  />
                  <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>
                    {dayLetters[i]}
                  </Text>
                </View>
              )
            })}
          </View>
          <Text style={[styles.weekSummary, { color: colors.textSecondary }]}>
            {activeDaysThisWeek} of 7 days active
          </Text>
        </View>

        {/* ── Per-habit stats ── */}
        {habits.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.sectionHeader }]}>HABITS</Text>
            {habits.map((habit) => {
              const stats = habitStats[habit.id]
              return (
                <View
                  key={habit.id}
                  style={[
                    styles.habitRow,
                    { backgroundColor: colors.cardBackground, shadowColor: colors.text },
                  ]}
                >
                  <View style={[styles.habitEmojiWrap, { backgroundColor: colors.primary + '18' }]}>
                    <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                  </View>
                  <View style={styles.habitInfo}>
                    <Text
                      style={[styles.habitName, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {habit.name}
                    </Text>
                    <View style={styles.habitMeta}>
                      <Text style={[styles.metaStat, { color: colors.streak }]}>
                        🔥 {stats?.currentStreak ?? 0}
                      </Text>
                      <Text style={[styles.metaDivider, { color: colors.border }]}>·</Text>
                      <Text style={[styles.metaStat, { color: colors.textSecondary }]}>
                        Best {stats?.longestStreak ?? 0}
                      </Text>
                      <Text style={[styles.metaDivider, { color: colors.border }]}>·</Text>
                      <Text style={[styles.metaStat, { color: colors.textSecondary }]}>
                        {stats?.totalCompletions ?? 0} done
                      </Text>
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Add habits on the Today tab to see your progress here.
            </Text>
          </View>
        )}

        {/* ── 8-week heatmap ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.sectionHeader }]}>
            8-WEEK ACTIVITY
          </Text>
          <View style={styles.heatmap}>
            {Array.from({ length: HEATMAP_DAYS / 7 }, (_, week) => (
              <View key={week} style={styles.heatRow}>
                <Text style={[styles.weekLabel, { color: colors.textSecondary }]}>
                  {weekLabels[week]}
                </Text>
                <View style={styles.heatCells}>
                  {Array.from({ length: 7 }, (_, day) => {
                    const date = gridDates[week * 7 + day]
                    const count = heatmapData.get(date) ?? 0
                    return (
                      <View
                        key={date}
                        style={[styles.heatCell, { backgroundColor: cellColor(count) }]}
                        accessibilityLabel={`${date}: ${count} completion${count !== 1 ? 's' : ''}`}
                      />
                    )
                  })}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24 },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 14,
  },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  dayCell: { alignItems: 'center', gap: 5 },
  dayDot: { width: 30, height: 30, borderRadius: 15 },
  dayLabel: { fontSize: 11, fontWeight: '600' },
  weekSummary: { fontSize: 13, textAlign: 'center' },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  habitEmojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitEmoji: { fontSize: 22 },
  habitInfo: { flex: 1 },
  habitName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  habitMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaStat: { fontSize: 13, fontWeight: '500' },
  metaDivider: { fontSize: 13 },
  heatmap: { gap: 4, alignItems: 'center' },
  heatRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weekLabel: { fontSize: 11, fontWeight: '500', width: 44, textAlign: 'right' },
  heatCells: { flexDirection: 'row', gap: 4 },
  heatCell: { width: 32, height: 32, borderRadius: 6 },
  empty: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
})
