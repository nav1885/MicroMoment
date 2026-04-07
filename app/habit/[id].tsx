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
  Modal,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'
import { useHabitStore } from '../../store/habitStore'
import { useThemeColors } from '../../hooks/useThemeColors'
import { Button } from '../../components/Button'

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

const OFFSET_OPTIONS = [
  { value: 0, label: 'At time' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hr' },
  { value: 120, label: '2 hrs' },
]

function formatReminderLabel(time: string, offsetMin: number): string {
  const opt = OFFSET_OPTIONS.find((o) => o.value === offsetMin)
  const offsetLabel = opt && offsetMin > 0 ? ` · ${opt.label} before` : ''
  return `${time}${offsetLabel}`
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
  const [editReminderTime, setEditReminderTime] = useState<string | null>(null)
  const [editReminderOffset, setEditReminderOffset] = useState(0)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [modalHour, setModalHour] = useState(8)
  const [modalMinute, setModalMinute] = useState(0)
  const [modalOffset, setModalOffset] = useState(0)

  useFocusEffect(
    useCallback(() => {
      loadHabits()
      loadTodayCompletions()
    }, [])
  )

  const habit = habits.find((h) => h.id === id)
  const isCompletedToday = todayCompletions.some((c) => c.habit_id === id)

  const enterEditMode = () => {
    if (!habit) return
    setEditName(habit.name)
    setEditEmoji(habit.emoji)
    setEditTimeOfDay(habit.time_of_day as TimeOfDay)
    setEditTimeEstimate(habit.time_estimate_min)
    setEditReminderTime(habit.reminder_time ?? null)
    setEditReminderOffset(habit.reminder_offset_min ?? 0)
    setEditMode(true)
  }

  // Auto-enter edit mode when navigated with ?mode=edit
  React.useEffect(() => {
    if (mode === 'edit' && habit) {
      enterEditMode()
    }
  }, [mode, habit?.id])

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
        reminder_time: editReminderTime,
        reminder_offset_min: editReminderTime ? editReminderOffset : null,
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
          style={[styles.headerBack, { padding: 20 }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
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
          {editMode ? (
            <Pressable onPress={() => setEditMode(false)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Cancel edit">
              <Text style={[styles.headerBtnText, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={styles.headerBack}
            >
              <Ionicons name="chevron-back" size={22} color={colors.primary} />
              <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
            </Pressable>
          )}
          {editMode ? (
            <Pressable
              onPress={handleSave}
              disabled={saving}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Save changes"
              style={{ opacity: saving ? 0.5 : 1 }}
            >
              <Text style={[styles.headerBtnText, { color: colors.primary }]}>
                {saving ? 'Saving…' : 'Save'}
              </Text>
            </Pressable>
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

              {/* Reminder */}
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.sectionHeader }]}>REMINDER</Text>
                <Pressable
                  onPress={() => {
                    if (editReminderTime) {
                      const [h, m] = editReminderTime.split(':').map(Number)
                      setModalHour(h)
                      setModalMinute(m)
                    } else {
                      setModalHour(8)
                      setModalMinute(0)
                    }
                    setModalOffset(editReminderOffset)
                    setShowReminderModal(true)
                  }}
                  style={[styles.reminderRow, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                  accessibilityRole="button"
                  accessibilityLabel="Set reminder"
                >
                  <Text style={[styles.reminderRowText, { color: editReminderTime ? colors.text : colors.textSecondary }]}>
                    {editReminderTime ? formatReminderLabel(editReminderTime, editReminderOffset) : 'No reminder'}
                  </Text>
                  {editReminderTime ? (
                    <Pressable
                      onPress={() => { setEditReminderTime(null); setEditReminderOffset(0) }}
                      hitSlop={12}
                      accessibilityRole="button"
                      accessibilityLabel="Clear reminder"
                    >
                      <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                    </Pressable>
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                  )}
                </Pressable>
              </View>

              {/* Danger zone */}
              <View style={[styles.dangerZone, { borderColor: colors.border }]}>
                <Text style={[styles.dangerTitle, { color: colors.textSecondary }]}>Danger Zone</Text>
                <Button
                  label="Archive Habit"
                  variant="secondary"
                  onPress={handleArchive}
                  accessibilityLabel="Archive habit"
                />
                <Button
                  label="Delete Habit"
                  variant="danger"
                  onPress={handleDelete}
                  accessibilityLabel="Delete habit"
                />
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
              <Button
                label={isCompletedToday ? 'Completed Today' : 'Mark Complete'}
                variant={isCompletedToday ? 'secondary' : 'primary'}
                onPress={handleMarkComplete}
                disabled={isCompletedToday}
                style={styles.completeBtn}
                accessibilityLabel={isCompletedToday ? 'Completed today' : 'Mark habit complete'}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Reminder modal */}
      <Modal
        visible={showReminderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReminderModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowReminderModal(false)}>
          <Pressable
            style={[styles.modalSheet, { backgroundColor: colors.cardBackground }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>Reminder</Text>

            <View style={styles.reminderTimeRow}>
              <View style={styles.picker}>
                <Pressable onPress={() => setModalHour((h) => (h + 1) % 24)} style={styles.pickerBtn}>
                  <Ionicons name="chevron-up" size={22} color={colors.primary} />
                </Pressable>
                <Text style={[styles.pickerValue, { color: colors.text }]}>{String(modalHour).padStart(2, '0')}</Text>
                <Pressable onPress={() => setModalHour((h) => (h - 1 + 24) % 24)} style={styles.pickerBtn}>
                  <Ionicons name="chevron-down" size={22} color={colors.primary} />
                </Pressable>
              </View>
              <Text style={[styles.timeSep, { color: colors.text }]}>:</Text>
              <View style={styles.picker}>
                <Pressable onPress={() => setModalMinute((m) => (m + 5) % 60)} style={styles.pickerBtn}>
                  <Ionicons name="chevron-up" size={22} color={colors.primary} />
                </Pressable>
                <Text style={[styles.pickerValue, { color: colors.text }]}>{String(modalMinute).padStart(2, '0')}</Text>
                <Pressable onPress={() => setModalMinute((m) => (m - 5 + 60) % 60)} style={styles.pickerBtn}>
                  <Ionicons name="chevron-down" size={22} color={colors.primary} />
                </Pressable>
              </View>
            </View>

            <Text style={[styles.offsetLabel, { color: colors.sectionHeader }]}>REMIND ME</Text>
            <View style={styles.offsetRow}>
              {OFFSET_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setModalOffset(opt.value)}
                  style={[
                    styles.offsetPill,
                    {
                      backgroundColor: modalOffset === opt.value ? colors.primary : colors.surface,
                      borderColor: modalOffset === opt.value ? colors.primary : colors.border,
                    },
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: modalOffset === opt.value }}
                >
                  <Text style={[styles.offsetPillText, { color: modalOffset === opt.value ? '#FFFFFF' : colors.text }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button
                label="Cancel"
                variant="secondary"
                onPress={() => setShowReminderModal(false)}
                style={styles.modalBtn}
              />
              <Button
                label="Set Reminder"
                variant="primary"
                onPress={() => {
                  setEditReminderTime(`${String(modalHour).padStart(2, '0')}:${String(modalMinute).padStart(2, '0')}`)
                  setEditReminderOffset(modalOffset)
                  setShowReminderModal(false)
                }}
                style={styles.modalBtn}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  headerBack: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  headerBtnText: { fontSize: 16, fontWeight: '600' },
  backText: { fontSize: 16, fontWeight: '500' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16 },
  // View mode
  hero: { alignItems: 'center', paddingVertical: 32 },
  heroEmoji: { fontSize: 64, marginBottom: 12 },
  heroName: { fontSize: 24, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  heroMeta: { fontSize: 15 },
  completeBtn: { marginTop: 8 },
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
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  timeRow: { flexDirection: 'row', gap: 10 },
  timePill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
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
    borderRadius: 14,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  stepperBtn: { paddingHorizontal: 24, paddingVertical: 10 },
  stepperBtnText: { fontSize: 26, fontWeight: '300' },
  stepperValue: { fontSize: 17, fontWeight: '600' },
  saveBtn: { marginBottom: 16 },
  dangerZone: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    marginTop: 8,
  },
  dangerTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 },
  // Reminder row
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  reminderRowText: { fontSize: 16 },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 32,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  reminderTimeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  picker: { alignItems: 'center' },
  pickerBtn: { padding: 8 },
  pickerValue: { fontSize: 36, fontWeight: '700', width: 64, textAlign: 'center' },
  timeSep: { fontSize: 30, fontWeight: '300', marginHorizontal: 4, paddingBottom: 4 },
  offsetLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  offsetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  offsetPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  offsetPillText: { fontSize: 13, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1 },
})
