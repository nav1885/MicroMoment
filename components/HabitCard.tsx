import React from 'react'
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { CheckButton } from './CheckButton'
import { useThemeColors } from '../hooks/useThemeColors'
import type { Habit } from '../db/habits'

const TIME_BADGES: Record<string, string> = {
  morning: '🌅',
  afternoon: '☀️',
  evening: '🌙',
}

interface HabitCardProps {
  habit: Habit
  completed: boolean
  streak?: number
  onComplete: () => void
  drag?: () => void
  isActive?: boolean
}

export function HabitCard({ habit, completed, streak, onComplete, drag, isActive }: HabitCardProps) {
  const colors = useThemeColors()
  const router = useRouter()
  const opacity = useSharedValue(1)

  React.useEffect(() => {
    opacity.value = withTiming(completed ? 0.45 : 1, { duration: 200 })
  }, [completed])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  const handlePress = () => {
    router.push(`/habit/${habit.id}`)
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${habit.emoji} ${habit.name}, ${habit.time_estimate_min} minute habit`}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: completed ? colors.completedCard : colors.cardBackground,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.left}>
            <Text style={styles.emoji}>{habit.emoji}</Text>
            <View style={styles.info}>
              <Text
                style={[
                  styles.name,
                  { color: completed ? colors.completedText : colors.text },
                ]}
                numberOfLines={1}
              >
                {habit.name}
              </Text>
              <View style={styles.meta}>
                <Text style={[styles.duration, { color: colors.textSecondary }]}>
                  {habit.time_estimate_min} min
                </Text>
                {streak !== undefined && streak >= 2 && (
                  <Text style={[styles.streak, { color: colors.primary }]}>
                    {' '}· 🔥 {streak}
                  </Text>
                )}
              </View>
            </View>
          </View>
          <CheckButton completed={completed} onPress={onComplete} />
          {drag && (
            <TouchableOpacity
              onLongPress={drag}
              delayLongPress={150}
              style={styles.dragHandle}
              hitSlop={8}
              accessibilityLabel="Hold to drag and reorder"
            >
              <Text style={[styles.dragIcon, { color: colors.textSecondary }]}>≡</Text>
            </TouchableOpacity>
          )}
        </View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    marginTop: 2,
  },
  duration: {
    fontSize: 13,
  },
  streak: {
    fontSize: 13,
    fontWeight: '600',
  },
  dragHandle: {
    paddingLeft: 10,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  dragIcon: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
})
