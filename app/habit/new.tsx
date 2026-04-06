import React, { useState } from 'react'
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
import { Stack, useRouter } from 'expo-router'
import { useHabitStore } from '../../store/habitStore'
import { useThemeColors } from '../../hooks/useThemeColors'

type TimeOfDay = 'morning' | 'afternoon' | 'evening'

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

export default function NewHabitScreen() {
  const colors = useThemeColors()
  const router = useRouter()
  const { createHabit } = useHabitStore()

  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🌱')
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning')
  const [timeEstimate, setTimeEstimate] = useState(5)
  const [saving, setSaving] = useState(false)

  // Reminder state
  const [reminderTime, setReminderTime] = useState<string | null>(null)
  const [reminderOffset, setReminderOffset] = useState(0)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [editHour, setEditHour] = useState(8)
  const [editMinute, setEditMinute] = useState(0)
  const [editOffset, setEditOffset] = useState(0)

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Give your habit a name.')
      return
    }
    setSaving(true)
    try {
      await createHabit({
        name: name.trim(),
        emoji,
        time_of_day: timeOfDay,
        time_estimate_min: timeEstimate,
        reminder_time: reminderTime,
        reminder_offset_min: reminderTime ? reminderOffset : null,
      })
      router.back()
    } catch (err) {
      setSaving(false)
      Alert.alert('Could not save', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'New Habit',
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              style={{ marginLeft: 4 }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 24 }}>✕</Text>
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          {/* Emoji */}
          <View style={styles.section}>
            <Text style={styles.emojiPreview}>{emoji}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.emojiRow}
            >
              {EMOJIS.map((e) => (
                <Pressable
                  key={e}
                  onPress={() => setEmoji(e)}
                  style={[
                    styles.emojiOption,
                    {
                      backgroundColor: emoji === e ? colors.primaryLight : colors.surface,
                      borderColor: emoji === e ? colors.primary : colors.border,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Select emoji ${e}`}
                  accessibilityState={{ selected: emoji === e }}
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
              placeholder="e.g. Morning stretch"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              maxLength={50}
              returnKeyType="done"
              accessibilityLabel="Habit name"
            />
          </View>

          {/* Time of day */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.sectionHeader }]}>TIME OF DAY</Text>
            <View style={styles.timeRow}>
              {TIME_OPTIONS.map(({ key, label, icon }) => (
                <Pressable
                  key={key}
                  onPress={() => setTimeOfDay(key)}
                  style={[
                    styles.timePill,
                    {
                      backgroundColor: timeOfDay === key ? colors.primary : colors.cardBackground,
                      borderColor: timeOfDay === key ? colors.primary : colors.border,
                    },
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: timeOfDay === key }}
                  accessibilityLabel={label}
                >
                  <Text style={styles.timePillIcon}>{icon}</Text>
                  <Text
                    style={[
                      styles.timePillLabel,
                      { color: timeOfDay === key ? '#FFFFFF' : colors.text },
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
            <Text style={[styles.sectionLabel, { color: colors.sectionHeader }]}>DURATION</Text>
            <View
              style={[
                styles.stepper,
                { backgroundColor: colors.cardBackground, borderColor: colors.border },
              ]}
            >
              <Pressable
                onPress={() => setTimeEstimate((v) => Math.max(1, v - 1))}
                disabled={timeEstimate <= 1}
                style={styles.stepperBtn}
                accessibilityRole="button"
                accessibilityLabel="Decrease duration"
              >
                <Text
                  style={[
                    styles.stepperBtnText,
                    { color: timeEstimate <= 1 ? colors.textSecondary : colors.primary },
                  ]}
                >
                  −
                </Text>
              </Pressable>
              <Text style={[styles.stepperValue, { color: colors.text }]}>
                {timeEstimate} min
              </Text>
              <Pressable
                onPress={() => setTimeEstimate((v) => Math.min(5, v + 1))}
                disabled={timeEstimate >= 5}
                style={styles.stepperBtn}
                accessibilityRole="button"
                accessibilityLabel="Increase duration"
              >
                <Text
                  style={[
                    styles.stepperBtnText,
                    { color: timeEstimate >= 5 ? colors.textSecondary : colors.primary },
                  ]}
                >
                  +
                </Text>
              </Pressable>
            </View>
            <Text style={[styles.stepperHint, { color: colors.textSecondary }]}>
              Habits must take 1–5 minutes to build consistency.
            </Text>
          </View>

          {/* Reminder */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.sectionHeader }]}>REMINDER</Text>
            <Pressable
              onPress={() => {
                if (reminderTime) {
                  const [h, m] = reminderTime.split(':').map(Number)
                  setEditHour(h)
                  setEditMinute(m)
                } else {
                  setEditHour(8)
                  setEditMinute(0)
                }
                setEditOffset(reminderOffset)
                setShowReminderModal(true)
              }}
              style={[styles.reminderRow, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel="Set reminder"
            >
              <Text style={[styles.reminderRowText, { color: reminderTime ? colors.text : colors.textSecondary }]}>
                {reminderTime ? formatReminderLabel(reminderTime, reminderOffset) : 'No reminder'}
              </Text>
              {reminderTime ? (
                <Pressable
                  onPress={() => { setReminderTime(null); setReminderOffset(0) }}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel="Clear reminder"
                >
                  <Text style={[styles.reminderClear, { color: colors.textSecondary }]}>✕</Text>
                </Pressable>
              ) : (
                <Text style={[styles.reminderChevron, { color: colors.textSecondary }]}>›</Text>
              )}
            </Pressable>
          </View>

          {/* Save */}
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveBtn, { backgroundColor: saving ? colors.border : colors.primary }]}
            accessibilityRole="button"
            accessibilityLabel="Save habit"
          >
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Habit'}</Text>
          </Pressable>

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

            {/* Time picker */}
            <View style={styles.reminderTimeRow}>
              <View style={styles.picker}>
                <Pressable onPress={() => setEditHour((h) => (h + 1) % 24)} style={styles.pickerBtn}>
                  <Text style={[styles.pickerArrow, { color: colors.primary }]}>▲</Text>
                </Pressable>
                <Text style={[styles.pickerValue, { color: colors.text }]}>{String(editHour).padStart(2, '0')}</Text>
                <Pressable onPress={() => setEditHour((h) => (h - 1 + 24) % 24)} style={styles.pickerBtn}>
                  <Text style={[styles.pickerArrow, { color: colors.primary }]}>▼</Text>
                </Pressable>
              </View>
              <Text style={[styles.timeSep, { color: colors.text }]}>:</Text>
              <View style={styles.picker}>
                <Pressable onPress={() => setEditMinute((m) => (m + 5) % 60)} style={styles.pickerBtn}>
                  <Text style={[styles.pickerArrow, { color: colors.primary }]}>▲</Text>
                </Pressable>
                <Text style={[styles.pickerValue, { color: colors.text }]}>{String(editMinute).padStart(2, '0')}</Text>
                <Pressable onPress={() => setEditMinute((m) => (m - 5 + 60) % 60)} style={styles.pickerBtn}>
                  <Text style={[styles.pickerArrow, { color: colors.primary }]}>▼</Text>
                </Pressable>
              </View>
            </View>

            {/* Offset pills */}
            <Text style={[styles.offsetLabel, { color: colors.sectionHeader }]}>REMIND ME</Text>
            <View style={styles.offsetRow}>
              {OFFSET_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setEditOffset(opt.value)}
                  style={[
                    styles.offsetPill,
                    {
                      backgroundColor: editOffset === opt.value ? colors.primary : colors.surface,
                      borderColor: editOffset === opt.value ? colors.primary : colors.border,
                    },
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: editOffset === opt.value }}
                >
                  <Text style={[styles.offsetPillText, { color: editOffset === opt.value ? '#FFFFFF' : colors.text }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setShowReminderModal(false)}
                style={[styles.modalBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setReminderTime(`${String(editHour).padStart(2, '0')}:${String(editMinute).padStart(2, '0')}`)
                  setReminderOffset(editOffset)
                  setShowReminderModal(false)
                }}
                style={[styles.modalBtn, { borderColor: colors.primary, backgroundColor: colors.primary }]}
              >
                <Text style={[styles.modalBtnText, { color: '#FFFFFF' }]}>Set</Text>
              </Pressable>
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
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },
  section: { marginBottom: 28 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
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
  stepperHint: { fontSize: 12, marginTop: 8, textAlign: 'center' },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
  // Reminder row
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  reminderRowText: { fontSize: 16 },
  reminderClear: { fontSize: 16, fontWeight: '500' },
  reminderChevron: { fontSize: 20 },
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
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
  reminderTimeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  picker: { alignItems: 'center' },
  pickerBtn: { padding: 12 },
  pickerArrow: { fontSize: 18 },
  pickerValue: { fontSize: 48, fontWeight: '700', width: 80, textAlign: 'center' },
  timeSep: { fontSize: 40, fontWeight: '300', marginHorizontal: 4, paddingBottom: 8 },
  offsetLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  offsetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 },
  offsetPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  offsetPillText: { fontSize: 13, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalBtnText: { fontSize: 16, fontWeight: '600' },
})
