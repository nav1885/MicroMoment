import { useColorScheme } from 'react-native'
import { Colors, ThemeColors } from '../constants/colors'

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme()
  return Colors[scheme === 'dark' ? 'dark' : 'light']
}
