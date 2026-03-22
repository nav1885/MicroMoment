import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { useThemeColors } from '../hooks/useThemeColors'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

interface CompletionRingProps {
  completed: number
  total: number
  size?: number
}

export function CompletionRing({ completed, total, size = 80 }: CompletionRingProps) {
  const colors = useThemeColors()
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const progress = useSharedValue(0)

  React.useEffect(() => {
    const ratio = total === 0 ? 0 : completed / total
    progress.value = withTiming(ratio, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    })
  }, [completed, total])

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }))

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.ringBackground}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.ringFill}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={[styles.label, { width: size, height: size }]}>
        <Text style={[styles.count, { color: colors.text }]}>
          {completed}/{total}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  label: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontSize: 15,
    fontWeight: '700',
  },
})
