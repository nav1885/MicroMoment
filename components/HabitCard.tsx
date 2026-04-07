import React, { useRef } from 'react'
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { Swipeable } from 'react-native-gesture-handler'
import { useRouter } from 'expo-router'
import { CheckButton } from './CheckButton'
import { useThemeColors } from '../hooks/useThemeColors'
import type { Habit } from '../db/habits'

interface HabitCardProps {
  habit: Habit
  completed: boolean
  streak?: number
  onComplete: () => void
  onEdit?: () => void
  onDelete?: () => void
  drag?: () => void
  isActive?: boolean
}

export function HabitCard({ habit, completed, streak, onComplete, onEdit, onDelete, drag, isActive }: HabitCardProps) {
  const colors = useThemeColors()
  const router = useRouter()
  const opacity = useSharedValue(1)
  const swipeableRef = useRef<Swipeable>(null)

  React.useEffect(() => {
    opacity.value = withTiming(completed ? 0.45 : 1, { duration: 200 })
  }, [completed])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  const handlePress = () => {
    router.push(`/habit/${habit.id}`)
  }

  const handleLongPress = () => {
    swipeableRef.current?.openRight()
  }

  const renderRightActions = () => (
    <View style={styles.swipeActions}>
      <Pressable
        style={[styles.swipeBtn, { backgroundColor: colors.primary }]}
        onPress={() => { swipeableRef.current?.close(); onEdit?.() }}
        accessibilityRole="button"
        accessibilityLabel="Edit habit"
      >
        <Text style={styles.swipeBtnText}>Edit</Text>
      </Pressable>
      <Pressable
        style={[styles.swipeBtn, { backgroundColor: colors.danger }]}
        onPress={() => { swipeableRef.current?.close(); onDelete?.() }}
        accessibilityRole="button"
        accessibilityLabel="Delete habit"
      >
        <Text style={styles.swipeBtnText}>Delete</Text>
      </Pressable>
    </View>
  )

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={400}
          accessibilityRole="button"
          accessibilityLabel={`${habit.emoji} ${habit.name}, ${habit.time_estimate_min} minute habit`}
        >
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.cardBackground,
                borderLeftColor: completed ? 'transparent' : colors.primary,
                shadowColor: colors.text,
              },
            ]}
          >
            {/* Emoji pill */}
            <View style={[styles.emojiWrap, { backgroundColor: colors.primary + '18' }]}>
              <Text style={styles.emoji}>{habit.emoji}</Text>
            </View>

            {/* Name + meta */}
            <View style={styles.info}>
              <Text
                style={[
                  styles.name,
                  {
                    color: completed ? colors.completedText : colors.text,
                    textDecorationLine: completed ? 'line-through' : 'none',
                  },
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
                  <View style={[styles.streakBadge, { backgroundColor: colors.streak + '20' }]}>
                    <Text style={[styles.streakText, { color: colors.streak }]}>
                      🔥 {streak}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Check button */}
            <CheckButton completed={completed} onPress={onComplete} />

            {/* Drag handle */}
            {drag && (
              <TouchableOpacity
                onLongPress={drag}
                delayLongPress={150}
                style={styles.dragHandle}
                hitSlop={8}
                accessibilityLabel="Hold to drag and reorder"
              >
                <Ionicons name="reorder-two" size={20} color={colors.border} />
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Animated.View>
    </Swipeable>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    borderLeftWidth: 3,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  emojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 22,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  duration: {
    fontSize: 13,
    fontWeight: '400',
  },
  streakBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dragHandle: {
    paddingLeft: 10,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  swipeActions: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  swipeBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 16,
    marginLeft: 6,
  },
  swipeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
})
