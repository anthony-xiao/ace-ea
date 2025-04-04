/**
 * Theme Provider for Ace Assistant
 * 
 * This component provides theming capabilities throughout the application,
 * supporting both light and dark modes, accessibility features, and
 * consistent styling across the application.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';

// Define theme colors
const lightTheme = {
  // Primary colors
  primary: '#007AFF',
  primaryDark: '#0062CC',
  primaryLight: '#4D9FFF',
  
  // Secondary colors
  secondary: '#34C759',
  secondaryDark: '#2A9F47',
  secondaryLight: '#70D98B',
  
  // Accent colors
  accent: '#FF9500',
  accentDark: '#CC7700',
  accentLight: '#FFAA33',
  
  // Error colors
  error: '#FF3B30',
  errorDark: '#CC2F26',
  errorLight: '#FF6B63',
  
  // Neutral colors
  background: '#FFFFFF',
  surface: '#F2F2F7',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#3C3C43',
  textTertiary: '#8E8E93',
  border: '#C6C6C8',
  divider: '#E5E5EA',
  
  // Status colors
  success: '#34C759',
  warning: '#FF9500',
  info: '#007AFF',
  
  // Specific UI elements
  tabBar: '#F9F9F9',
  tabBarActive: '#007AFF',
  tabBarInactive: '#8E8E93',
  navigationBar: '#F9F9F9',
  
  // Transparency
  overlay: 'rgba(0, 0, 0, 0.5)',
  modalBackground: 'rgba(0, 0, 0, 0.3)',
  
  // Misc
  shadow: '#000000',
  placeholder: '#C7C7CC',
  highlight: 'rgba(0, 122, 255, 0.1)',
  
  // Mode identifier
  isDark: false
};

const darkTheme = {
  // Primary colors
  primary: '#0A84FF',
  primaryDark: '#0774E0',
  primaryLight: '#409CFF',
  
  // Secondary colors
  secondary: '#30D158',
  secondaryDark: '#28B84C',
  secondaryLight: '#5FDC7F',
  
  // Accent colors
  accent: '#FF9F0A',
  accentDark: '#E08C09',
  accentLight: '#FFB340',
  
  // Error colors
  error: '#FF453A',
  errorDark: '#E03C32',
  errorLight: '#FF6961',
  
  // Neutral colors
  background: '#000000',
  surface: '#1C1C1E',
  card: '#2C2C2E',
  text: '#FFFFFF',
  textSecondary: '#EBEBF5',
  textTertiary: '#8E8E93',
  border: '#38383A',
  divider: '#38383A',
  
  // Status colors
  success: '#30D158',
  warning: '#FF9F0A',
  info: '#0A84FF',
  
  // Specific UI elements
  tabBar: '#1C1C1E',
  tabBarActive: '#0A84FF',
  tabBarInactive: '#8E8E93',
  navigationBar: '#1C1C1E',
  
  // Transparency
  overlay: 'rgba(0, 0, 0, 0.6)',
  modalBackground: 'rgba(0, 0, 0, 0.5)',
  
  // Misc
  shadow: '#000000',
  placeholder: '#636366',
  highlight: 'rgba(10, 132, 255, 0.2)',
  
  // Mode identifier
  isDark: true
};

// Define typography
const typography = {
  // Font families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  
  // Line heights
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    xxxl: 42,
  },
  
  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
  
  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

// Define spacing
const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Define border radius
const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

// Define shadows
const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Define animations
const animations = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 400,
    entrance: 500,
    exit: 200,
  },
  easing: {
    easeInOut: 'ease-in-out',
    easeOut: 'ease-out',
    easeIn: 'ease-in',
    linear: 'linear',
  },
};

// Define haptics
const haptics = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};

// Create theme context
const ThemeContext = createContext();

/**
 * Theme Provider component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Provider component
 */
export const ThemeProvider = ({ children }) => {
  // Get device color scheme
  const colorScheme = useColorScheme();
  
  // State for theme and accessibility settings
  const [theme, setTheme] = useState(colorScheme === 'dark' ? darkTheme : lightTheme);
  const [fontScale, setFontScale] = useState(1);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [reduceTransparency, setReduceTransparency] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [enableHaptics, setEnableHaptics] = useState(true);
  
  // Update theme when device color scheme changes
  useEffect(() => {
    setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
  }, [colorScheme]);
  
  // Function to toggle theme manually
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme.isDark ? lightTheme : darkTheme);
    
    // Provide haptic feedback
    if (enableHaptics) {
      haptics.medium();
    }
  };
  
  // Function to set specific theme
  const setSpecificTheme = (themeName) => {
    if (themeName === 'light') {
      setTheme(lightTheme);
    } else if (themeName === 'dark') {
      setTheme(darkTheme);
    }
    
    // Provide haptic feedback
    if (enableHaptics) {
      haptics.light();
    }
  };
  
  // Apply high contrast modifications if enabled
  useEffect(() => {
    if (highContrast) {
      setTheme(prevTheme => ({
        ...prevTheme,
        // Increase contrast for text colors
        textSecondary: prevTheme.isDark ? '#FFFFFF' : '#000000',
        textTertiary: prevTheme.isDark ? '#EBEBF5' : '#3C3C43',
        // Increase contrast for borders
        border: prevTheme.isDark ? '#FFFFFF' : '#000000',
        divider: prevTheme.isDark ? '#FFFFFF' : '#000000',
      }));
    } else {
      // Reset to standard theme
      setTheme(prevTheme => prevTheme.isDark ? darkTheme : lightTheme);
    }
  }, [highContrast]);
  
  // Create the full theme object
  const fullTheme = {
    ...theme,
    typography: {
      ...typography,
      // Apply font scaling
      fontSize: Object.entries(typography.fontSize).reduce((acc, [key, value]) => {
        acc[key] = value * fontScale;
        return acc;
      }, {}),
      lineHeight: Object.entries(typography.lineHeight).reduce((acc, [key, value]) => {
        acc[key] = value * fontScale;
        return acc;
      }, {}),
    },
    spacing,
    borderRadius,
    shadows: reduceTransparency 
      ? Object.entries(shadows).reduce((acc, [key, value]) => {
          acc[key] = key === 'none' ? value : { ...value, shadowOpacity: 0, elevation: 0 };
          return acc;
        }, {})
      : shadows,
    animations: reduceMotion
      ? {
          ...animations,
          duration: Object.entries(animations.duration).reduce((acc, [key]) => {
            acc[key] = 0; // Set all durations to 0 when reduce motion is enabled
            return acc;
          }, {}),
        }
      : animations,
    haptics: enableHaptics ? haptics : Object.entries(haptics).reduce((acc, [key]) => {
      acc[key] = () => {}; // No-op function when haptics are disabled
      return acc;
    }, {}),
  };
  
  // Theme context value
  const themeContextValue = {
    theme: fullTheme,
    toggleTheme,
    setTheme: setSpecificTheme,
    isDark: theme.isDark,
    // Accessibility settings
    fontScale,
    setFontScale,
    reduceMotion,
    setReduceMotion,
    reduceTransparency,
    setReduceTransparency,
    highContrast,
    setHighContrast,
    enableHaptics,
    setEnableHaptics,
  };
  
  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use the theme
 * @returns {Object} Theme context
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

export default ThemeProvider;
