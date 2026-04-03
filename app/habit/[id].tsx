import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native'
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'
import { useHabitStore } from '../../store/habitStore'
import { useThemeColors } from '../../hooks/useThemeColors'

type TimeOfDay = 'morning' | 'afternoon' | 'evening'

const EMOJIS = [
  '🧘', '🏃', '💪', '🚶', '🏋️', '🤸', '🚴', '🏊', '⛹️', '🧗',
  '📚', '✍️', '🎨', '🎵', '🎸', '🧩', '♟️', '🎯', '📝', '💡',
  '🥗', '💧', '☕', '🍎', '🥑', '🥦', '😴', '🌙', '🌅', '🌿',
  '🌱', '🧹', '🧺', '💊', '🦷', '🛁', '💰', '🤝', '📱', '🏡',
]

const TIME_OPTIONS: { key: TimeOfDay; label: string; icon: string }[] = [
  { key: 'morning', label: 'Morning', icon: '🌅' },
  { key: 'afternoon', label: 'Afternoon', icon: '☀️' },
  { key: 'evening', label: 'Evening', icon: '🌙' },
]

const TIME_LABELS: Record<TimeOfDay, string> = {
  morning: '🌅 Morning',
  afternoon: '☀️ Afternoon',
  evening: '🌙 Evening',
}

export default function HabitDetailScreen() {
  const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>()
  const colors = useThemeColors()
  const router = useRouter()
  const {
    habits,
    todayCompletions,
    loadHabits,
    loadTodayCompletions,
    updateHabit,
    archiveHabit,
    deleteHabit,
    markComplete,
  } = useHabitStore()

  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)

  // Edit-form state
  const [editName, setEditName] = useState('')
  const [editEmoji, setEditEmoji] = useState('')
  const [editTimeOfDay, setEditTimeOfDay] = useState<TimeOfDay>('morning')
  const [editTimeEstimate, setEditTimeEstimate] = useState(5)

  useFocusEffect(
    useCallback(() => {
      loadHabits()
      loadTodayCompletions()
    }, [])
  )

  // Auto-enter edit mode when navigated with ?mode=edit
  React.useEffect(() => {
    if (mode === 'edit' && habit) {
      enterEditMode()
    }
  }, [mode, habit?.id])

  const habit = habits.find((h) => h.id === id)
  const isCompletedToday = todayCompletions.some((c) => c.habit_id === id)

  const enterEditMode = () => {
    if (!habit) return
    setEditName(habit.name)
    setEditEmoji(habit.emoji)
    setEditTimeOfDay(habit.time_of_day as TimeOfDay)
    setEditTimeEstimate(habit.time_estimate_min)
    setEditMode(true)
  }

  const handleSave = async () => {
    if (!editName.trim()) {
      Alert.alert('Name required', 'Give your habit a name.')
      return
    }
    setSaving(true)
    try {
      await updateHabit(id, {
        name: editName.trim(),
        emoji: editEmoji,
        time_of_day: editTimeOfDay,
        time_estimate_min: editTimeEstimate,
      })
      setEditMode(false)
    } catch (err) {
      Alert.alert('Could not save', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  const handleMarkComplete = async () => {
    try {
      await markComplete(id)
    } catch {
      // Already completed today — ignore silently
    }
  }

  const handleArchive = () => {
    Alert.alert('Archive habit?', 'You can restore it later from Settings.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        style: 'destructive',
        onPress: async () => {
          await archiveHabit(id)
          router.back()
        },
      },
    ])
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete habit?',
      'This permanently deletes the habit and all its history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteHabit(id)
            router.back()
          },
        },
      ]
    )
  }

  if (!habit) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </Pressable>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>
            Habit not found.
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </Pressable>
          {editMode ? (
            <View style={styles.headerActions}>
              <Pressable onPress={() => setEditMode(false)} hitSlop={12}>
                <Text style={[styles.headerBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSave} disabled={saving} hitSlop={12}>
                <Text
                  style={[
                    styles.headerBtnText,
                    { color: saving ? colors.textSecondary : colors.primary },
                  ]}
                >
                  Save
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={enterEditMode}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Edit habit"
            >
              <Text style={[styles.headerBtnText, { color: colors.primary }]}>Edit</Text>
            </Pressable>
          )}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {editMode ? (
            <>
              {/* Emoji picker */}
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.sectionHeader }]}>EMOJI</Text>
                <Text style={styles.emojiPreview}>{editEmoji}</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.emojiRow}
                >
                  {EMOJIS.map((e) => (
                    <Pressable
                      key={e}
                      onPress={() => setEditEmoji(e)}
                      style={[
                        styles.emojiOption,
                        {
                          backgroundColor:
                            editEmoji === e ? colors.primaryLight : colors.surface,
                          borderColor: editEmoji === e ? colors.primary : colors.border,
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Select emoji ${e}`}
                      accessibilityState={{ selected: editEmoji === e }}
                    >
                      <Text style={styles.emojiOptionText}>{e}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Name */}
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.sectionHeader }]}>NAME</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={editName}
                  onChangeText={setEditName}
                  maxLength={50}
                  returnKeyType="done"
                  accessibilityLabel="Habit name"
                />
              </View>

              {/* Time of day */}
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.sectionHeader }]}>
                  TIME OF DAY
                </Text>
                <View style={styles.timeRow}>
                  {TIME_OPTIONS.map(({ key, label, icon }) => (
                    <Pressable
                      key={key}
                      onPress={() => setEditTimeOfDay(key)}
                      style={[
                        styles.timePill,
                        {
                          backgroundColor:
                            editTimeOfDay === key ? colors.primary : colors.cardBackground,
                          borderColor:
                            editTimeOfDay === key ? colors.primary : colors.border,
                        },
                      ]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: editTimeOfDay === key }}
                      accessibilityLabel={label}
                    >
                      <Text style={styles.timePillIcon}>{icon}</Text>
                      <Text
                        style={[
                          styles.timePillLabel,
                          { color: editTimeOfDay === key ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Duration */}
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.sectionHeader }]}>
                  DURATION
                </Text>
                <View
                  style={[
                    styles.stepper,
                    { backgroundColor: colors.cardBackground, borderColor: colors.border },
                  ]}
                >
                  <Pressable
                    onPress={() => setEditTimeEstimate((v) => Math.max(1, v - 1))}
                    disabled={editTimeEstimate <= 1}
                    style={styles.stepperBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Decrease duration"
                  >
                    <Text
                      style={[
                        styles.stepperBtnText,
                        {
                          color:
                            editTimeEstimate <= 1 ? colors.textSecondary : colors.primary,
                        },
                      ]}
                    >
                      −
                    </Text>
                  </Pressable>
                  <Text style={[styles.stepperValue, { color: colors.text }]}>
                    {editTimeEstimate} min
                  </Text>
                  <Pressable
                    onPress={() => setEditTimeEstimate((v) => Math.min(5, v + 1))}
                    disabled={editTimeEstimate >= 5}
                    style={styles.stepperBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Increase duration"
                  >
                    <Text
                      style={[
                        styles.stepperBtnText,
                        {
                          color:
                            editTimeEstimate >= 5 ? colors.textSecondary : colors.primary,
                        },
                      ]}
                    >
                      +
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Danger zone */}
              <View style={[styles.dangerZone, { borderColor: colors.danger }]}>
                <Text style={[styles.dangerTitle, { color: colors.danger }]}>Danger Zone</Text>
                <Pressable
                  onPress={handleArchive}
                  style={[styles.dangerBtn, { borderColor: colors.border }]}
                  accessibilityRole="button"
                  accessibilityLabel="Archive habit"
                >
                  <Text style={[styles.dangerBtnText, { color: colors.text }]}>
                    Archive Habit
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleDelete}
                  style={[styles.dangerBtn, { borderColor: colors.danger }]}
                  accessibilityRole="button"
                  accessibilityLabel="Delete habit"
                >
                  <Text style={[styles.dangerBtnText, { color: colors.danger }]}>
                    Delete Habit
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              {/* Hero */}
              <View style={styles.hero}>
                <Text style={styles.heroEmoji}>{habit.emoji}</Text>
                <Text style={[styles.heroName, { color: colors.text }]}>{habit.name}</Text>
                <Text style={[styles.heroMeta, { color: colors.textSecondary }]}>
                  {TIME_LABELS[habit.time_of_day as TimeOfDay]} · {habit.time_estimate_min} min
                </Text>
              </View>

              {/* Mark complete */}
              <Pressable
                onPress={handleMarkComplete}
                disabled={isCompletedToday}
                style={[
                  styles.completeBtn,
                  {
                    backgroundColor: isCompletedToday ? colors.completedCard : colors.primary,
                    borderColor: isCompletedToday ? colors.border : colors.primary,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={
                  isCompletedToday ? 'Completed today' : 'Mark habit complete'
                }
                accessibilityState={{ disabled: isCompletedToday }}
              >
                <Text
                  style={[
                    styles.completeBtnText,
                    { color: isCompletedToday ? colors.completedText : '#FFFFFF' },
                  ]}
                >
                  {isCompletedToday ? '✓ Completed Today' : 'Mark Complete'}
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerActions: { flexDirection: 'row', gap: 16 },
  headerBtnText: { fontSize: 16, fontWeight: '600' },
  backBtn: { padding: 20 },
  backText: { fontSize: 16 },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16 },
  // View mode
  hero: { alignItems: 'center', paddingVertical: 32 },
  heroEmoji: { fontSize: 64, marginBottom: 12 },
  heroName: { fontSize: 24, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  heroMeta: { fontSize: 15 },
  completeBtn: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  completeBtnText: { fontSize: 17, fontWeight: '600' },
  // Edit form
  section: { marginBottom: 28 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  emojiPreview: { fontSize: 56, textAlign: 'center', marginBottom: 12 },
  emojiRow: { paddingVertical: 4, gap: 8 },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiOptionText: { fontSize: 22 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  timeRow: { flexDirection: 'row', gap: 10 },
  timePill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 4,
  },
  timePillIcon: { fontSize: 20 },
  timePillLabel: { fontSize: 13, fontWeight: '600' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  stepperBtn: { paddingHorizontal: 20, paddingVertical: 8 },
  stepperBtnText: { fontSize: 24, fontWeight: '300' },
  stepperValue: { fontSize: 17, fontWeight: '600' },
  dangerZone: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 10,
    marginTop: 8,
  },
  dangerTitle: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  dangerBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerBtnText: { fontSize: 15, fontWeight: '500' },
})
