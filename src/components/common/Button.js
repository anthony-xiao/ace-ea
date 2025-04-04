/**
 * Enhanced Button Component for Ace Assistant
 * 
 * This component provides a consistent button experience throughout the application
 * with support for different variants, sizes, and accessibility features.
 */

import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  View 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Button component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const Button = ({ 
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, text, danger
  size = 'medium', // small, medium, large
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
  testID,
  ...rest
}) => {
  // Get theme
  const { theme } = useTheme();
  
  // Handle press with haptic feedback
  const handlePress = () => {
    if (disabled || loading) return;
    
    // Provide haptic feedback based on variant
    switch (variant) {
      case 'primary':
        theme.haptics.medium();
        break;
      case 'secondary':
        theme.haptics.light();
        break;
      case 'danger':
        theme.haptics.error();
        break;
      default:
        theme.haptics.light();
        break;
    }
    
    onPress();
  };
  
  // Get button styles based on variant and size
  const getButtonStyles = () => {
    // Base styles
    const baseStyles = [styles.button];
    
    // Add variant styles
    switch (variant) {
      case 'primary':
        baseStyles.push({
          backgroundColor: theme.primary,
          borderColor: theme.primary,
        });
        break;
      case 'secondary':
        baseStyles.push({
          backgroundColor: theme.secondary,
          borderColor: theme.secondary,
        });
        break;
      case 'outline':
        baseStyles.push({
          backgroundColor: 'transparent',
          borderColor: theme.primary,
          borderWidth: 1,
        });
        break;
      case 'text':
        baseStyles.push({
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        });
        break;
      case 'danger':
        baseStyles.push({
          backgroundColor: theme.error,
          borderColor: theme.error,
        });
        break;
      default:
        baseStyles.push({
          backgroundColor: theme.primary,
          borderColor: theme.primary,
        });
        break;
    }
    
    // Add size styles
    switch (size) {
      case 'small':
        baseStyles.push({
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.sm,
          borderRadius: theme.borderRadius.sm,
        });
        break;
      case 'medium':
        baseStyles.push({
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.borderRadius.md,
        });
        break;
      case 'large':
        baseStyles.push({
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.borderRadius.md,
        });
        break;
      default:
        baseStyles.push({
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.borderRadius.md,
        });
        break;
    }
    
    // Add disabled styles
    if (disabled) {
      baseStyles.push({
        opacity: 0.5,
      });
    }
    
    // Add full width style
    if (fullWidth) {
      baseStyles.push({
        width: '100%',
      });
    }
    
    // Add shadow for primary and secondary variants
    if ((variant === 'primary' || variant === 'secondary') && !disabled) {
      baseStyles.push(theme.shadows.sm);
    }
    
    return baseStyles;
  };
  
  // Get text styles based on variant and size
  const getTextStyles = () => {
    // Base styles
    const baseStyles = [styles.text];
    
    // Add variant styles
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        baseStyles.push({
          color: '#FFFFFF',
        });
        break;
      case 'outline':
        baseStyles.push({
          color: theme.primary,
        });
        break;
      case 'text':
        baseStyles.push({
          color: theme.primary,
        });
        break;
      default:
        baseStyles.push({
          color: '#FFFFFF',
        });
        break;
    }
    
    // Add size styles
    switch (size) {
      case 'small':
        baseStyles.push({
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium,
        });
        break;
      case 'medium':
        baseStyles.push({
          fontSize: theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.semiBold,
        });
        break;
      case 'large':
        baseStyles.push({
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semiBold,
        });
        break;
      default:
        baseStyles.push({
          fontSize: theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.semiBold,
        });
        break;
    }
    
    return baseStyles;
  };
  
  // Get icon size based on button size
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 20;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };
  
  // Get icon color based on variant
  const getIconColor = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return '#FFFFFF';
      case 'outline':
      case 'text':
        return theme.primary;
      default:
        return '#FFFFFF';
    }
  };
  
  // Render loading spinner
  const renderLoading = () => (
    <ActivityIndicator 
      size={size === 'small' ? 'small' : 'small'} 
      color={variant === 'outline' || variant === 'text' ? theme.primary : '#FFFFFF'} 
      style={styles.loadingIndicator} 
    />
  );
  
  // Render icon
  const renderIcon = () => {
    if (!icon) return null;
    
    return (
      <Ionicons 
        name={icon} 
        size={getIconSize()} 
        color={getIconColor()} 
        style={[
          styles.icon,
          iconPosition === 'left' ? styles.iconLeft : styles.iconRight
        ]} 
      />
    );
  };
  
  return (
    <TouchableOpacity
      style={[...getButtonStyles(), style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      testID={testID}
      {...rest}
    >
      <View style={styles.contentContainer}>
        {loading && renderLoading()}
        {!loading && iconPosition === 'left' && renderIcon()}
        {title && (
          <Text style={[...getTextStyles(), textStyle]}>
            {title}
          </Text>
        )}
        {!loading && iconPosition === 'right' && renderIcon()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  icon: {
    
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  loadingIndicator: {
    marginRight: 8,
  },
});

export default Button;
