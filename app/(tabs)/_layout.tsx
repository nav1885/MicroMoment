import { Tabs } from 'expo-router'
import { useColorScheme, Text } from 'react-native'
import { Colors } from '../../constants/colors'

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light']

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => <TabIcon glyph="✓" color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => <TabIcon glyph="▦" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabIcon glyph="⚙" color={color} />,
        }}
      />
    </Tabs>
  )
}

function TabIcon({ glyph, color }: { glyph: string; color: string }) {
  return (
    <Text style={{ fontSize: 20, color, lineHeight: 24 }}>{glyph}</Text>
  )
}
