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

  // date → count of completions (for heatmap + weekly row)
  const [heatmapData, setHeatmapData] = useState<Map<string, number>>(new Map())
  // habitId → StreakResult (all-time)
  const [habitStats, setHabitStats] = useState<Record<string, StreakResult>>({})

  useFocusEffect(
    useCallback(() => {
      loadHabits()
      loadStreaks()
      loadScreenData()
    }, [])
  )

  const loadScreenData = async () => {
    // Heatmap: last 56 days
    const endDate = localDateString(0)
    const startDate = localDateString(HEATMAP_DAYS - 1)
    const rangeCompletions = await getCompletionsByDateRange(startDate, endDate)

    const map = new Map<string, number>()
    for (const c of rangeCompletions) {
      map.set(c.completed_date, (map.get(c.completed_date) ?? 0) + 1)
    }
    setHeatmapData(map)
  }

  // Load all-time stats for each visible habit whenever habits list changes
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

  // Run when habits list is populated
  React.useEffect(() => {
    loadHabitStats()
  }, [loadHabitStats])

  // ── Weekly row (last 7 days) ──
  const last7 = Array.from({ length: 7 }, (_, i) => localDateString(6 - i))
  const activeDaysThisWeek = last7.filter((d) => (heatmapData.get(d) ?? 0) > 0).length
  const dayLetters = last7.map((d) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(d).getDay()])

  // ── Heatmap grid ──
  const gridDates = Array.from({ length: HEATMAP_DAYS }, (_, i) =>
    localDateString(HEATMAP_DAYS - 1 - i)
  )
  const totalHabits = Math.max(habits.length, 1)

  const cellColor = (count: number): string => {
    if (count === 0) return colors.ringBackground
    const ratio = count / totalHabits
    if (ratio >= 1) return colors.ringFill
    if (ratio >= 0.5) return colors.primary
    return colors.primaryLight
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
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
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
                      { backgroundColor: active ? colors.ringFill : colors.ringBackground },
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
                    { backgroundColor: colors.cardBackground, borderColor: colors.border },
                  ]}
                >
                  <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                  <View style={styles.habitInfo}>
                    <Text
                      style={[styles.habitName, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {habit.name}
                    </Text>
                    <View style={styles.habitMeta}>
                      <Text style={[styles.metaStat, { color: colors.primary }]}>
                        🔥 {stats?.currentStreak ?? 0}
                      </Text>
                      <Text style={[styles.metaDot, { color: colors.border }]}> · </Text>
                      <Text style={[styles.metaStat, { color: colors.textSecondary }]}>
                        Best {stats?.longestStreak ?? 0}
                      </Text>
                      <Text style={[styles.metaDot, { color: colors.border }]}> · </Text>
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
            ))}
          </View>
          <View style={styles.heatLegend}>
            <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>Less</Text>
            {[0, 0.3, 0.7, 1].map((ratio, i) => (
              <View
                key={i}
                style={[styles.legendCell, { backgroundColor: cellColor(Math.round(ratio * totalHabits)) }]}
              />
            ))}
            <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>More</Text>
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
  title: { fontSize: 28, fontWeight: '700', marginBottom: 20 },
  // Card
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  // Weekly row
  weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  dayCell: { alignItems: 'center', gap: 4 },
  dayDot: { width: 28, height: 28, borderRadius: 14 },
  dayLabel: { fontSize: 11, fontWeight: '600' },
  weekSummary: { fontSize: 13, textAlign: 'center' },
  // Section
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  // Habit rows
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  habitEmoji: { fontSize: 28 },
  habitInfo: { flex: 1 },
  habitName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  habitMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  metaStat: { fontSize: 13, fontWeight: '500' },
  metaDot: { fontSize: 13 },
  // Heatmap
  heatmap: { gap: 4 },
  heatRow: { flexDirection: 'row', gap: 4 },
  heatCell: { width: 36, height: 36, borderRadius: 6 },
  heatLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    justifyContent: 'flex-end',
  },
  legendCell: { width: 16, height: 16, borderRadius: 3 },
  legendLabel: { fontSize: 11 },
  // Empty
  empty: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
})
