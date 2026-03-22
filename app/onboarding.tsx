import React, { useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Dimensions,
  SafeAreaView,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { useThemeColors } from '../hooks/useThemeColors'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const ONBOARDING_KEY = 'onboarding_complete'

interface Slide {
  key: string
  emoji: string
  headline: string
  body: string
}

const SLIDES: Slide[] = [
  {
    key: 'one',
    emoji: '🌱',
    headline: "Five minutes.\nEvery day.\nThat's it.",
    body: 'The smallest habits compound into meaningful change. MicroMoment keeps it simple.',
  },
  {
    key: 'two',
    emoji: '✋',
    headline: 'Pick up to 5\nhabits to focus\non.',
    body: 'Fewer habits done consistently beats many habits done occasionally. Quality over quantity.',
  },
  {
    key: 'three',
    emoji: '🔥',
    headline: 'Check in daily.\nBuild streaks.\nGrow.',
    body: 'Each day you show up, your streak grows. Hit milestones and celebrate the small wins.',
  },
]

export default function OnboardingScreen() {
  const colors = useThemeColors()
  const router = useRouter()
  const listRef = useRef<FlatList<Slide>>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1
      listRef.current?.scrollToIndex({ index: next, animated: true })
      setCurrentIndex(next)
    } else {
      handleGetStarted()
    }
  }

  const handleGetStarted = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, '1')
    router.replace('/(tabs)')
  }

  const isLast = currentIndex === SLIDES.length - 1

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.primary }]}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.slideEmoji}>{item.emoji}</Text>
            <Text style={styles.slideHeadline}>{item.headline}</Text>
            <Text style={styles.slideBody}>{item.body}</Text>
          </View>
        )}
      />

      {/* Dot indicators */}
      <View style={styles.dotsRow}>
        {SLIDES.map((s, i) => (
          <View
            key={s.key}
            style={[
              styles.dot,
              { backgroundColor: i === currentIndex ? '#FFFFFF' : 'rgba(255,255,255,0.35)' },
            ]}
            accessibilityLabel={`Slide ${i + 1} of ${SLIDES.length}`}
          />
        ))}
      </View>

      {/* CTA button */}
      <View style={styles.buttonRow}>
        <Pressable
          onPress={handleNext}
          style={styles.ctaButton}
          accessibilityRole="button"
          accessibilityLabel={isLast ? 'Get started' : 'Next slide'}
        >
          <Text style={[styles.ctaText, { color: colors.primary }]}>
            {isLast ? 'Get Started' : 'Next'}
          </Text>
        </Pressable>

        {!isLast && (
          <Pressable
            onPress={handleGetStarted}
            style={styles.skipButton}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingBottom: 40,
  },
  slideEmoji: {
    fontSize: 80,
    marginBottom: 32,
  },
  slideHeadline: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 20,
  },
  slideBody: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.80)',
    textAlign: 'center',
    lineHeight: 26,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  buttonRow: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    gap: 12,
  },
  ctaButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 15,
  },
})
