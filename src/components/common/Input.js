/**
 * Enhanced Input Component for Ace Assistant
 * 
 * This component provides a consistent input experience throughout the application
 * with support for different variants, validation, and accessibility features.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Input component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = true,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  disabled = false,
  error,
  helper,
  leftIcon,
  rightIcon,
  onRightIconPress,
  onLeftIconPress,
  onFocus,
  onBlur,
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit,
  clearable = false,
  style,
  inputStyle,
  labelStyle,
  placeholderTextColor,
  testID,
  accessibilityLabel,
  ...rest
}) => {
  // Get theme
  const { theme } = useTheme();
  
  // Refs
  const inputRef = useRef(null);
  const focusAnim = useRef(new Animated.Value(0)).current;
  
  // State
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  // Determine if the input has content
  const hasContent = value && value.length > 0;
  
  // Animate label on focus/blur
  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: (isFocused || hasContent) ? 1 : 0,
      duration: theme.animations.duration.shorter,
      easing: theme.animations.easing.easeInOut,
      useNativeDriver: false,
    }).start();
  }, [isFocused, hasContent, focusAnim, theme.animations.duration.shorter, theme.animations.easing.easeInOut]);
  
  // Handle focus
  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
    
    // Provide haptic feedback
    theme.haptics.light();
  };
  
  // Handle blur
  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };
  
  // Handle clear
  const handleClear = () => {
    onChangeText('');
    inputRef.current?.focus();
    
    // Provide haptic feedback
    theme.haptics.light();
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
    
    // Provide haptic feedback
    theme.haptics.light();
  };
  
  // Focus the input
  const focus = () => {
    inputRef.current?.focus();
  };
  
  // Blur the input
  const blur = () => {
    inputRef.current?.blur();
  };
  
  // Animated label styles
  const labelTop = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [multiline ? 16 : 14, -8],
  });
  
  const labelFontSize = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.typography.fontSize.md, theme.typography.fontSize.sm],
  });
  
  // Determine input container styles
  const getInputContainerStyles = () => {
    const baseStyles = [styles.inputContainer, {
      borderColor: theme.border,
      backgroundColor: theme.surface,
      borderRadius: theme.borderRadius.md,
      minHeight: multiline ? 100 : 48,
    }];
    
    if (isFocused) {
      baseStyles.push({
        borderColor: theme.primary,
        borderWidth: 2,
      });
    }
    
    if (error) {
      baseStyles.push({
        borderColor: theme.error,
      });
    }
    
    if (disabled) {
      baseStyles.push({
        backgroundColor: theme.isDark ? theme.surface : '#F2F2F7',
        opacity: 0.7,
      });
    }
    
    return baseStyles;
  };
  
  // Determine input styles
  const getInputStyles = () => {
    const baseStyles = [styles.input, {
      color: theme.text,
      fontSize: theme.typography.fontSize.md,
      paddingTop: multiline ? 32 : (label ? 16 : 0),
      textAlignVertical: multiline ? 'top' : 'center',
    }];
    
    if (leftIcon) {
      baseStyles.push({
        paddingLeft: 40,
      });
    }
    
    if (rightIcon || secureTextEntry || clearable) {
      baseStyles.push({
        paddingRight: 40,
      });
    }
    
    return baseStyles;
  };
  
  // Render left icon
  const renderLeftIcon = () => {
    if (!leftIcon) return null;
    
    return (
      <TouchableOpacity 
        style={styles.leftIcon} 
        onPress={onLeftIconPress}
        disabled={!onLeftIconPress}
        accessibilityRole={onLeftIconPress ? "button" : "image"}
      >
        <Ionicons 
          name={leftIcon} 
          size={20} 
          color={isFocused ? theme.primary : theme.textTertiary} 
        />
      </TouchableOpacity>
    );
  };
  
  // Render right icon
  const renderRightIcon = () => {
    // Password toggle icon
    if (secureTextEntry) {
      return (
        <TouchableOpacity 
          style={styles.rightIcon} 
          onPress={togglePasswordVisibility}
          accessibilityRole="button"
          accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
        >
          <Ionicons 
            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
            size={20} 
            color={theme.textTertiary} 
          />
        </TouchableOpacity>
      );
    }
    
    // Clear button
    if (clearable && hasContent) {
      return (
        <TouchableOpacity 
          style={styles.rightIcon} 
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel="Clear text"
        >
          <Ionicons 
            name="close-circle" 
            size={20} 
            color={theme.textTertiary} 
          />
        </TouchableOpacity>
      );
    }
    
    // Custom right icon
    if (rightIcon) {
      return (
        <TouchableOpacity 
          style={styles.rightIcon} 
          onPress={onRightIconPress}
          disabled={!onRightIconPress}
          accessibilityRole={onRightIconPress ? "button" : "image"}
        >
          <Ionicons 
            name={rightIcon} 
            size={20} 
            color={isFocused ? theme.primary : theme.textTertiary} 
          />
        </TouchableOpacity>
      );
    }
    
    return null;
  };
  
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={focus}
        disabled={disabled}
        style={getInputContainerStyles()}
        accessibilityRole="none"
      >
        {label && (
          <Animated.Text
            style={[
              styles.label,
              {
                top: labelTop,
                fontSize: labelFontSize,
                color: error 
                  ? theme.error 
                  : (isFocused 
                    ? theme.primary 
                    : theme.textSecondary),
                backgroundColor: isFocused || hasContent 
                  ? theme.surface 
                  : 'transparent',
              },
              labelStyle,
            ]}
          >
            {label}
          </Animated.Text>
        )}
        
        {renderLeftIcon()}
        
        <TextInput
          ref={inputRef}
          style={[getInputStyles(), inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={(!isFocused && label) ? '' : placeholder}
          placeholderTextColor={placeholderTextColor || theme.textTertiary}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          maxLength={maxLength}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
          textAlignVertical={multiline ? 'top' : 'center'}
          testID={testID}
          accessibilityLabel={accessibilityLabel || label || placeholder}
          accessibilityState={{ disabled }}
          accessibilityHint={error || helper}
          {...rest}
        />
        
        {renderRightIcon()}
      </TouchableOpacity>
      
      {(error || helper) && (
        <Text 
          style={[
            styles.helperText, 
            { 
              color: error ? theme.error : theme.textTertiary,
              marginTop: theme.spacing.xs,
            }
          ]}
        >
          {error || helper}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
    height: '100%',
  },
  label: {
    position: 'absolute',
    left: 16,
    paddingHorizontal: 4,
    zIndex: 1,
  },
  leftIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 2,
  },
  rightIcon: {
    position: 'absolute',
    right: 12,
    zIndex: 2,
  },
  helperText: {
    fontSize: 12,
    marginLeft: 16,
  },
});

export default Input;
