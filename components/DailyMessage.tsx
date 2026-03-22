import React from 'react'
import { Text, StyleSheet } from 'react-native'
import { getDailyMessage } from '../constants/messages'
import { useThemeColors } from '../hooks/useThemeColors'

export function DailyMessage() {
  const colors = useThemeColors()
  const message = getDailyMessage()

  return (
    <Text
      style={[styles.message, { color: colors.textSecondary }]}
      accessibilityRole="text"
      accessibilityLabel={`Daily message: ${message}`}
    >
      &ldquo;{message}&rdquo;
    </Text>
  )
}

const styles = StyleSheet.create({
  message: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 8,
  },
})
