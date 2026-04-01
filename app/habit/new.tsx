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
} from 'react-native'
import { Stack, useRouter } from 'expo-router'
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

export default function NewHabitScreen() {
  const colors = useThemeColors()
  const router = useRouter()
  const { createHabit } = useHabitStore()

  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🌱')
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning')
  const [timeEstimate, setTimeEstimate] = useState(5)
  const [saving, setSaving] = useState(false)

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
          headerRight: () => (
            <Pressable
              onPress={handleSave}
              disabled={saving}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Save habit"
            >
              <Text style={{ color: saving ? colors.textSecondary : colors.primary, fontSize: 26 }}>✓</Text>
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

        </ScrollView>
      </KeyboardAvoidingView>
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
})
