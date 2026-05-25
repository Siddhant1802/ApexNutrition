import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function AnimatedBackground({ variant = 'blue' }) {
  const animatedValue1 = useRef(new Animated.Value(0)).current;
  const animatedValue2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(animatedValue1, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue1, {
            toValue: 0,
            duration: 8000,
            useNativeDriver: false,
          }),
        ]),
        Animated.sequence([
          Animated.timing(animatedValue2, {
            toValue: 1,
            duration: 6000,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue2, {
            toValue: 0,
            duration: 6000,
            useNativeDriver: false,
          }),
        ]),
      ])
    ).start();
  }, []);

  const colorSchemes = {
    blue: {
  color1: ['#0000cd', '#4169E1', '#0000cd'],
  color2: ['#4169E1', '#1E90FF', '#4169E1'],
},
    green: {
      color1: ['#56ab2f', '#a8e063', '#56ab2f'],
      color2: ['#a8e063', '#4CAF50', '#a8e063'],
    },
    orange: {
      color1: ['#f12711', '#f5af19', '#f12711'],
      color2: ['#f5af19', '#FF6B6B', '#f5af19'],
    },
    purple: {
      color1: ['#667eea', '#764ba2', '#667eea'],
      color2: ['#764ba2', '#f093fb', '#764ba2'],
    },
    teal: {
      color1: ['#4ECDC4', '#556270', '#4ECDC4'],
      color2: ['#556270', '#00d2ff', '#556270'],
    },
  };

  const colors = colorSchemes[variant] || colorSchemes.blue;

  const backgroundColor1 = animatedValue1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: colors.color1,
  });

  const backgroundColor2 = animatedValue2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: colors.color2,
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.gradient1, { backgroundColor: backgroundColor1 }]}
      />
      <Animated.View
        style={[styles.gradient2, { backgroundColor: backgroundColor2 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gradient1: {
    position: 'absolute',
    width: width * 2,
    height: height * 2,
    top: -height / 2,
    left: -width / 2,
    borderRadius: width,
    opacity: 0.3,
  },
  gradient2: {
    position: 'absolute',
    width: width * 1.5,
    height: height * 1.5,
    bottom: -height / 2,
    right: -width / 2,
    borderRadius: width,
    opacity: 0.3,
  },
});