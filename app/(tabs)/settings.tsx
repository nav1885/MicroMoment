import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  SafeAreaView,
  Alert,
} from 'react-native'
import * as Application from 'expo-application'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect, useRouter } from 'expo-router'
import { useHabitStore } from '../../store/habitStore'
import { scheduleHabitReminders } from '../../utils/notifications'
import { useThemeColors } from '../../hooks/useThemeColors'
import type { Habit } from '../../db/habits'

type TimeGroup = 'morning' | 'afternoon' | 'evening'

const TIME_GROUP_LABELS: Record<TimeGroup, { label: string; icon: string }> = {
  morning: { label: 'Morning', icon: '🌅' },
  afternoon: { label: 'Afternoon', icon: '☀️' },
  evening: { label: 'Evening', icon: '🌙' },
}

function parseTime(hhmm: string): { hour: number; minute: number } {
  const [h, m] = hhmm.split(':').map(Number)
  return { hour: h, minute: m }
}

function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export default function SettingsScreen() {
  const colors = useThemeColors()
  const router = useRouter()
  const { habits, notificationTimes, loadNotificationTimes, saveNotificationTimes, getArchivedHabits, restoreHabit } =
    useHabitStore()

  const [archivedHabits, setArchivedHabits] = useState<Habit[]>([])
  const [editingGroup, setEditingGroup] = useState<TimeGroup | null>(null)
  const [editHour, setEditHour] = useState(7)
  const [editMinute, setEditMinute] = useState(0)

  useFocusEffect(
    useCallback(() => {
      loadNotificationTimes()
      getArchivedHabits().then(setArchivedHabits)
    }, [])
  )

  const openTimeEditor = (group: TimeGroup) => {
    const { hour, minute } = parseTime(notificationTimes[group])
    setEditHour(hour)
    setEditMinute(minute)
    setEditingGroup(group)
  }

  const handleSaveTime = async () => {
    if (!editingGroup) return
    const newTime = formatTime(editHour, editMinute)
    await saveNotificationTimes({ [editingGroup]: newTime })
    setEditingGroup(null)
    // Reschedule with updated time
    scheduleHabitReminders(
      { ...notificationTimes, [editingGroup]: newTime },
      habits
    )
  }

  const handleRestore = async (habitId: string) => {
    try {
      await restoreHabit(habitId)
      const updated = await getArchivedHabits()
      setArchivedHabits(updated)
    } catch (err) {
      Alert.alert('Cannot restore', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleResetOnboarding = () => {
    Alert.alert('Reset onboarding?', 'The welcome screens will show again on next launch.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('onboarding_complete')
          router.replace('/onboarding')
        },
      },
    ])
  }

  const appVersion = Application.nativeApplicationVersion ?? '—'

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        {/* ── Notifications ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.sectionHeader }]}>
            DAILY REMINDERS
          </Text>
          {(['morning', 'afternoon', 'evening'] as TimeGroup[]).map((group) => (
            <Pressable
              key={group}
              onPress={() => openTimeEditor(group)}
              style={[styles.row, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${group} reminder time`}
            >
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>{TIME_GROUP_LABELS[group].icon}</Text>
                <Text style={[styles.rowLabel, { color: colors.text }]}>
                  {TIME_GROUP_LABELS[group].label}
                </Text>
              </View>
              <Text style={[styles.rowValue, { color: colors.primary }]}>
                {notificationTimes[group]}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Archived habits ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.sectionHeader }]}>
            ARCHIVED HABITS
          </Text>
          {archivedHabits.length === 0 ? (
            <View style={[styles.row, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Text style={[styles.emptyArchive, { color: colors.textSecondary }]}>
                No archived habits
              </Text>
            </View>
          ) : (
            archivedHabits.map((habit) => (
              <View
                key={habit.id}
                style={[styles.row, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              >
                <View style={styles.rowLeft}>
                  <Text style={styles.rowIcon}>{habit.emoji}</Text>
                  <Text style={[styles.rowLabel, { color: colors.text }]} numberOfLines={1}>
                    {habit.name}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleRestore(habit.id)}
                  style={[styles.restoreBtn, { borderColor: colors.primary }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Restore ${habit.name}`}
                >
                  <Text style={[styles.restoreBtnText, { color: colors.primary }]}>Restore</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        {/* ── App info ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.sectionHeader }]}>ABOUT</Text>
          <View style={[styles.row, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Version</Text>
            <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{appVersion}</Text>
          </View>
          <Pressable
            onPress={handleResetOnboarding}
            style={[styles.row, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Reset onboarding"
          >
            <Text style={[styles.rowLabel, { color: colors.text }]}>Reset onboarding</Text>
            <Text style={[styles.rowValue, { color: colors.textSecondary }]}>›</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* ── Time picker modal ── */}
      <Modal
        visible={editingGroup !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingGroup(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setEditingGroup(null)}>
          <Pressable
            style={[styles.modalSheet, { backgroundColor: colors.cardBackground }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingGroup ? TIME_GROUP_LABELS[editingGroup].label : ''} Reminder
            </Text>

            <View style={styles.timeRow}>
              {/* Hour */}
              <View style={styles.picker}>
                <Pressable
                  onPress={() => setEditHour((h) => (h + 1) % 24)}
                  style={styles.pickerBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Increase hour"
                >
                  <Text style={[styles.pickerArrow, { color: colors.primary }]}>▲</Text>
                </Pressable>
                <Text style={[styles.pickerValue, { color: colors.text }]}>
                  {String(editHour).padStart(2, '0')}
                </Text>
                <Pressable
                  onPress={() => setEditHour((h) => (h - 1 + 24) % 24)}
                  style={styles.pickerBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Decrease hour"
                >
                  <Text style={[styles.pickerArrow, { color: colors.primary }]}>▼</Text>
                </Pressable>
              </View>

              <Text style={[styles.timeSep, { color: colors.text }]}>:</Text>

              {/* Minute (5-min increments) */}
              <View style={styles.picker}>
                <Pressable
                  onPress={() => setEditMinute((m) => (m + 5) % 60)}
                  style={styles.pickerBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Increase minute"
                >
                  <Text style={[styles.pickerArrow, { color: colors.primary }]}>▲</Text>
                </Pressable>
                <Text style={[styles.pickerValue, { color: colors.text }]}>
                  {String(editMinute).padStart(2, '0')}
                </Text>
                <Pressable
                  onPress={() => setEditMinute((m) => (m - 5 + 60) % 60)}
                  style={styles.pickerBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Decrease minute"
                >
                  <Text style={[styles.pickerArrow, { color: colors.primary }]}>▼</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setEditingGroup(null)}
                style={[styles.modalBtn, { borderColor: colors.border }]}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
              >
                <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveTime}
                style={[styles.modalBtn, { borderColor: colors.primary, backgroundColor: colors.primary }]}
                accessibilityRole="button"
                accessibilityLabel="Set reminder time"
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
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowIcon: { fontSize: 20, marginRight: 12 },
  rowLabel: { fontSize: 16, fontWeight: '500' },
  rowValue: { fontSize: 15, fontWeight: '600' },
  emptyArchive: { fontSize: 15 },
  restoreBtn: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  restoreBtnText: { fontSize: 14, fontWeight: '600' },
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
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  picker: { alignItems: 'center' },
  pickerBtn: { padding: 12 },
  pickerArrow: { fontSize: 18 },
  pickerValue: { fontSize: 48, fontWeight: '700', width: 80, textAlign: 'center' },
  timeSep: { fontSize: 40, fontWeight: '300', marginHorizontal: 4, paddingBottom: 8 },
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
