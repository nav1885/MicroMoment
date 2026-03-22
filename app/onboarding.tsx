import { View, Text, StyleSheet } from 'react-native'
import { useThemeColors } from '../hooks/useThemeColors'

export default function OnboardingScreen() {
  const colors = useThemeColors()

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Text style={styles.headline}>Five minutes.{'\n'}Every day.{'\n'}That&apos;s it.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  headline: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 44,
  },
})
