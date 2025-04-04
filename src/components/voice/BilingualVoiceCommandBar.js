// Voice Command Interface Mockup
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';
import { useLocalization } from '../../hooks/useLocalization';

const BilingualVoiceCommandBar = () => {
  const { theme } = useTheme();
  const { isListening, startListening, stopListening, results, language } = useVoiceCommands();
  const { t, changeLanguage } = useLocalization();
  
  // Animation values
  const [animation] = useState(new Animated.Value(0));
  const [waveAnimation] = useState(new Animated.Value(0));
  
  // Start wave animation when listening
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      waveAnimation.setValue(0);
    }
  }, [isListening, waveAnimation]);
  
  // Expand animation when listening
  useEffect(() => {
    Animated.timing(animation, {
      toValue: isListening ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isListening, animation]);
  
  // Calculate expanded height
  const expandedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 200],
  });
  
  // Handle microphone press
  const handleMicPress = () => {
    if (isListening) {
      stopListening();
      theme.haptics.medium();
    } else {
      startListening();
      theme.haptics.medium();
    }
  };
  
  // Toggle language
  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'zh' : 'en';
    changeLanguage(newLanguage);
    theme.haptics.light();
  };
  
  // Render wave circles
  const renderWaveCircles = () => {
    const circles = [];
    const colors = [
      theme.primary,
      theme.primaryLight,
      theme.primaryDark,
      theme.accent,
      theme.secondary,
    ];
    
    for (let i = 0; i < 5; i++) {
      const scale = waveAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.5 + i * 0.1],
      });
      
      const opacity = waveAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8 - i * 0.15, 0],
      });
      
      circles.push(
        <Animated.View
          key={i}
          style={[
            styles.waveCircle,
            {
              backgroundColor: colors[i],
              transform: [{ scale }],
              opacity,
            },
          ]}
        />
      );
    }
    
    return circles;
  };
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          height: expandedHeight,
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        }
      ]}
    >
      {isListening && (
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultsText, { color: theme.text }]}>
            {results || t('listening')}
          </Text>
          
          <View style={styles.suggestionsContainer}>
            <Text style={[styles.suggestionsTitle, { color: theme.textSecondary }]}>
              {t('try_saying')}:
            </Text>
            <View style={styles.suggestionsList}>
              <View style={[styles.suggestionItem, { backgroundColor: theme.surface }]}>
                <Text style={[styles.suggestionText, { color: theme.text }]}>
                  {language === 'en' ? "Create a task to review the marketing plan" : "创建任务审核营销计划"}
                </Text>
              </View>
              <View style={[styles.suggestionItem, { backgroundColor: theme.surface }]}>
                <Text style={[styles.suggestionText, { color: theme.text }]}>
                  {language === 'en' ? "Schedule a meeting with John tomorrow" : "安排明天与约翰的会议"}
                </Text>
              </View>
              <View style={[styles.suggestionItem, { backgroundColor: theme.surface }]}>
                <Text style={[styles.suggestionText, { color: theme.text }]}>
                  {language === 'en' ? "Send an email to Sarah about the project" : "发送关于项目的电子邮件给莎拉"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[styles.languageButton, { backgroundColor: theme.surface }]}
          onPress={toggleLanguage}
        >
          <Text style={[styles.languageText, { color: theme.text }]}>
            {language === 'en' ? 'EN' : '中文'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.micContainer}>
          {isListening && renderWaveCircles()}
          <TouchableOpacity
            style={[
              styles.micButton,
              {
                backgroundColor: isListening ? theme.error : theme.primary,
              },
            ]}
            onPress={handleMicPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isListening ? 'close-outline' : 'mic-outline'}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.helpButton, { backgroundColor: theme.surface }]}
        >
          <Ionicons name="help-circle-outline" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderTopWidth: 1,
    justifyContent: 'space-between',
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultsText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  suggestionsContainer: {
    marginTop: 8,
  },
  suggestionsTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  suggestionsList: {
    
  },
  suggestionItem: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  languageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageText: {
    fontWeight: 'bold',
  },
  micContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BilingualVoiceCommandBar;
