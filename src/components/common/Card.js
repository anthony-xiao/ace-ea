/**
 * Enhanced Card Component for Ace Assistant
 * 
 * This component provides a consistent card experience throughout the application
 * with support for different variants, interactions, and accessibility features.
 */

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Card component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const Card = ({
  title,
  subtitle,
  children,
  icon,
  iconColor,
  rightIcon,
  onPress,
  onLongPress,
  variant = 'default', // default, elevated, outlined, flat
  disabled = false,
  footer,
  footerStyle,
  style,
  titleStyle,
  subtitleStyle,
  contentStyle,
  testID,
  accessibilityLabel,
  ...rest
}) => {
  // Get theme
  const { theme } = useTheme();
  
  // Handle press with haptic feedback
  const handlePress = () => {
    if (disabled || !onPress) return;
    
    // Provide haptic feedback
    theme.haptics.light();
    
    onPress();
  };
  
  // Handle long press with haptic feedback
  const handleLongPress = () => {
    if (disabled || !onLongPress) return;
    
    // Provide haptic feedback
    theme.haptics.medium();
    
    onLongPress();
  };
  
  // Get card styles based on variant
  const getCardStyles = () => {
    // Base styles
    const baseStyles = [styles.card];
    
    // Add variant styles
    switch (variant) {
      case 'elevated':
        baseStyles.push({
          backgroundColor: theme.card,
          borderRadius: theme.borderRadius.md,
          ...theme.shadows.md,
        });
        break;
      case 'outlined':
        baseStyles.push({
          backgroundColor: theme.card,
          borderRadius: theme.borderRadius.md,
          borderWidth: 1,
          borderColor: theme.border,
        });
        break;
      case 'flat':
        baseStyles.push({
          backgroundColor: theme.surface,
          borderRadius: theme.borderRadius.md,
        });
        break;
      default:
        baseStyles.push({
          backgroundColor: theme.card,
          borderRadius: theme.borderRadius.md,
          ...theme.shadows.sm,
        });
        break;
    }
    
    // Add disabled styles
    if (disabled) {
      baseStyles.push({
        opacity: 0.5,
      });
    }
    
    return baseStyles;
  };
  
  // Determine if the card is interactive
  const isInteractive = onPress || onLongPress;
  
  // Wrapper component based on interactivity
  const CardWrapper = isInteractive ? TouchableOpacity : View;
  
  // Interactive props
  const interactiveProps = isInteractive ? {
    onPress: handlePress,
    onLongPress: handleLongPress,
    activeOpacity: 0.7,
    disabled,
    accessibilityRole: 'button',
  } : {};
  
  // Render header if title or subtitle exists
  const renderHeader = () => {
    if (!title && !subtitle && !icon && !rightIcon) return null;
    
    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {icon && (
            <View style={styles.iconContainer}>
              <Ionicons 
                name={icon} 
                size={24} 
                color={iconColor || theme.primary} 
              />
            </View>
          )}
          <View style={styles.titleContainer}>
            {title && (
              <Text 
                style={[
                  styles.title, 
                  { 
                    color: theme.text,
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.semiBold,
                  },
                  titleStyle
                ]}
                numberOfLines={1}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text 
                style={[
                  styles.subtitle, 
                  { 
                    color: theme.textSecondary,
                    fontSize: theme.typography.fontSize.sm,
                  },
                  subtitleStyle
                ]}
                numberOfLines={2}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {rightIcon && (
          <Ionicons 
            name={rightIcon} 
            size={24} 
            color={theme.textSecondary} 
          />
        )}
      </View>
    );
  };
  
  // Render footer if it exists
  const renderFooter = () => {
    if (!footer) return null;
    
    return (
      <View 
        style={[
          styles.footer, 
          { 
            borderTopWidth: 1,
            borderTopColor: theme.divider,
            paddingTop: theme.spacing.sm,
            marginTop: theme.spacing.sm,
          },
          footerStyle
        ]}
      >
        {footer}
      </View>
    );
  };
  
  return (
    <CardWrapper
      style={[...getCardStyles(), style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled }}
      {...interactiveProps}
      {...rest}
    >
      {renderHeader()}
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
      {renderFooter()}
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 2,
  },
  subtitle: {
    
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});

export default Card;
