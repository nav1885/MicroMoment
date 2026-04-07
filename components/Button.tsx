import React from 'react'
import { Text, StyleSheet, PressableProps, ActivityIndicator, ViewStyle } from 'react-native'
import { AnimatedPressable } from './AnimatedPressable'
import { useThemeColors } from '../hooks/useThemeColors'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string
  variant?: ButtonVariant
  loading?: boolean
  style?: ViewStyle
}

export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const colors = useThemeColors()
  const isDisabled = disabled || loading

  const containerStyle: ViewStyle = {
    ...styles.base,
    ...(variant === 'primary' && {
      backgroundColor: isDisabled ? colors.border : colors.primary,
    }),
    ...(variant === 'secondary' && {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.border,
    }),
    ...(variant === 'danger' && {
      backgroundColor: colors.danger,
    }),
    ...(variant === 'ghost' && {
      backgroundColor: 'transparent',
      paddingVertical: 8,
    }),
    ...style,
  }

  const textColor =
    variant === 'primary' || variant === 'danger'
      ? '#FFFFFF'
      : variant === 'secondary'
      ? colors.text
      : colors.textSecondary

  return (
    <AnimatedPressable
      haptic={!isDisabled && variant !== 'ghost'}
      disabled={isDisabled}
      style={[containerStyle, isDisabled && styles.disabled]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  disabled: {
    opacity: 0.45,
  },
})
