import { useFactory } from './useFactory';
import { LightTheme, DarkTheme } from '../theme/tokens';

export function useTheme() {
  const { isDarkMode } = useFactory();
  const theme = isDarkMode ? DarkTheme : LightTheme;
  
  return {
    theme,
    isDarkMode,
  };
}
