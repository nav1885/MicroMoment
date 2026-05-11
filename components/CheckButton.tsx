import React from 'react'
import { Pressable, StyleSheet, AccessibilityInfo } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useThemeColors } from '../hooks/useThemeColors'
import { useReduceMotion } from '../hooks/useReduceMotion'

interface CheckButtonProps {
  completed: boolean
  onPress: () => void
  size?: number
}

export function CheckButton({ completed, onPress, size = 44 }: CheckButtonProps) {
  const colors = useThemeColors()
  const reduceMotion = useReduceMotion()
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePress = () => {
    if (completed) return

    if (!reduceMotion) {
      scale.value = withSpring(1.3, { damping: 6 }, () => {
        scale.value = withSpring(1)
      })
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }

    runOnJS(onPress)()
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: completed }}
      accessibilityLabel={completed ? 'Habit completed' : 'Mark habit complete'}
    >
      <Animated.View
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: completed ? colors.checkActive : 'transparent',
            borderColor: completed ? colors.checkActive : colors.checkInactive,
          },
          animatedStyle,
        ]}
      >
        {completed && (
          <Animated.Text style={styles.checkmark}>✓</Animated.Text>
        )}
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
})
