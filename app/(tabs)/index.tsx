import React, { useCallback, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native'
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist'
import ConfettiCannon from 'react-native-confetti-cannon'
import { useFocusEffect, useRouter } from 'expo-router'
import { useHabitStore } from '../../store/habitStore'
import { CompletionRing } from '../../components/CompletionRing'
import { HabitCard } from '../../components/HabitCard'
import { DailyMessage } from '../../components/DailyMessage'
import { useThemeColors } from '../../hooks/useThemeColors'

import { AnimatedPressable } from '../../components/AnimatedPressable'
import { trackHabitCompleted, trackStreakMilestone } from '../../utils/analytics'
import type { Habit } from '../../db/habits'

const MILESTONE_STREAKS = new Set([7, 14, 21, 30, 60, 90, 180, 365])

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export default function HomeScreen() {
  const colors = useThemeColors()
  const router = useRouter()
  const confettiRef = useRef<ConfettiCannon>(null)
  const {
    habits,
    todayCompletions,
    streaks,
    loadHabits,
    loadTodayCompletions,
    loadStreaks,
    markComplete,
    getHabitStreak,
    reorderHabits,
    deleteHabit,
  } = useHabitStore()

  useFocusEffect(
    useCallback(() => {
      loadHabits()
      loadTodayCompletions()
      loadStreaks()
    }, [])
  )

  const completedIds = new Set(todayCompletions.map((c) => c.habit_id))
  const completedCount = habits.filter((h) => completedIds.has(h.id)).length

  const handleComplete = async (habitId: string) => {
    try {
      await markComplete(habitId)
      const newStreak = await getHabitStreak(habitId)
      trackHabitCompleted(habitId, newStreak)
      if (MILESTONE_STREAKS.has(newStreak)) {
        confettiRef.current?.start()
        trackStreakMilestone(habitId, newStreak)
      }
      loadStreaks()
    } catch {
      // Already completed — ignore silently
    }
  }

  const handleAddHabit = () => {
    if (habits.length >= 5) return
    router.push('/habit/new')
  }

  const handleDragEnd = ({ data }: { data: Habit[] }) => {
    reorderHabits(data.map((h) => h.id))
  }

  const handleEdit = (habitId: string) => {
    router.push(`/habit/${habitId}?mode=edit`)
  }

  const handleDelete = (habitId: string, habitName: string) => {
    Alert.alert(
      `Delete "${habitName}"?`,
      'This permanently deletes the habit and all its history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteHabit(habitId)
          },
        },
      ]
    )
  }

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Habit>) => (
    <ScaleDecorator>
      <HabitCard
        habit={item}
        completed={completedIds.has(item.id)}
        streak={streaks[item.id]}
        onComplete={() => handleComplete(item.id)}
        onEdit={() => handleEdit(item.id)}
        onDelete={() => handleDelete(item.id, item.name)}
        drag={drag}
        isActive={isActive}
      />
    </ScaleDecorator>
  )

  const ListHeader = (
    <View style={styles.listHeader}>
      {/* Date + message */}
      <View style={styles.header}>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {formatDate(new Date())}
        </Text>
        <DailyMessage />
      </View>

      {/* Completion ring */}
      {habits.length > 0 && (
        <View style={styles.ringRow}>
          <CompletionRing completed={completedCount} total={habits.length} size={80} />
        </View>
      )}

      {/* Empty state */}
      {habits.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🌱</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No habits yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Add your first habit to get started.{'\n'}Five minutes is all it takes.
          </Text>
        </View>
      )}

      {/* 5-habit cap message */}
      {habits.length >= 5 && (
        <View style={[styles.capBanner, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.capText, { color: colors.primary }]}>
            You have 5 habits. Focus on mastering these first.
          </Text>
        </View>
      )}

      {/* Drag hint */}
      {habits.length > 1 && (
        <Text style={[styles.dragHint, { color: colors.textSecondary }]}>
          Hold ≡ to reorder
        </Text>
      )}
    </View>
  )

  const ListFooter = (
    <View style={styles.listFooter}>
      <AnimatedPressable
        onPress={handleAddHabit}
        haptic={habits.length < 5}
        style={[
          styles.addButton,
          {
            borderColor: habits.length >= 5 ? colors.border : colors.primary,
            opacity: habits.length >= 5 ? 0.4 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Add new habit"
        accessibilityState={{ disabled: habits.length >= 5 }}
      >
        <Text
          style={[
            styles.addButtonText,
            { color: habits.length >= 5 ? colors.textSecondary : colors.primary },
          ]}
        >
          + Add Habit
        </Text>
      </AnimatedPressable>
    </View>
  )

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ConfettiCannon
        ref={confettiRef}
        count={120}
        origin={{ x: Dimensions.get('window').width / 2, y: -20 }}
        autoStart={false}
        fadeOut
        fallSpeed={3000}
      />
      <DraggableFlatList
        data={habits}
        keyExtractor={(h) => h.id}
        renderItem={renderItem}
        onDragEnd={handleDragEnd}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        activationDistance={5}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  listHeader: { paddingTop: 20, paddingBottom: 8 },
  listFooter: { paddingTop: 8 },
  header: { marginBottom: 20 },
  date: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  ringRow: { alignItems: 'center', marginBottom: 24 },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  capBanner: { borderRadius: 10, padding: 12, marginBottom: 16 },
  capText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  dragHint: { fontSize: 11, textAlign: 'center', marginBottom: 8 },
  addButton: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: { fontSize: 15, fontWeight: '600' },
})
