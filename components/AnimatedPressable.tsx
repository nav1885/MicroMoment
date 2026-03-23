import React from 'react'
import { Pressable, PressableProps, AccessibilityInfo } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

interface AnimatedPressableProps extends PressableProps {
  children: React.ReactNode
  haptic?: boolean
}

/**
 * A Pressable that scales down slightly on press-in and pops back on release.
 * Pass haptic=true to fire a Light impact when pressed (skipped under ReduceMotion).
 */
export function AnimatedPressable({
  children,
  haptic = false,
  onPress,
  style,
  ...rest
}: AnimatedPressableProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 18, stiffness: 250 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 18, stiffness: 250 })
  }

  const handlePress: PressableProps['onPress'] = (e) => {
    if (haptic) {
      AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
        if (!reduced) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }
      })
    }
    onPress?.(e)
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={style}
        {...rest}
      >
        {children}
      </Pressable>
    </Animated.View>
  )
}
