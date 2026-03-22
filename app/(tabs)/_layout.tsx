import { Tabs } from 'expo-router'
import { useColorScheme, View } from 'react-native'
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
          tabBarIcon: ({ color }) => (
            <TabIcon symbol="checkmark.circle.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => (
            <TabIcon symbol="chart.bar.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <TabIcon symbol="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  )
}

function TabIcon({ symbol, color }: { symbol: string; color: string }) {
  // Placeholder — will use SF Symbols or emoji icons
  return <View style={{ width: 24, height: 24 }} />
}
