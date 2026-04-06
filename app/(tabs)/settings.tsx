import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Alert,
} from 'react-native'
import * as Application from 'expo-application'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect, useRouter } from 'expo-router'
import { useHabitStore } from '../../store/habitStore'
import { useThemeColors } from '../../hooks/useThemeColors'
import type { Habit } from '../../db/habits'

export default function SettingsScreen() {
  const colors = useThemeColors()
  const router = useRouter()
  const { getArchivedHabits, restoreHabit } = useHabitStore()

  const [archivedHabits, setArchivedHabits] = useState<Habit[]>([])

  useFocusEffect(
    useCallback(() => {
      getArchivedHabits().then(setArchivedHabits)
    }, [])
  )

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
})
