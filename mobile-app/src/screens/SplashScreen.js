import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { athleteAPI } from '../services/api';
import { SPORTS } from '../constants/sports';
import { DT } from '../constants/darkTheme';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Check auth after animation
    setTimeout(() => checkAuth(), 1200);
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        navigation.replace('Login');
        return;
      }

      const profileResponse = await athleteAPI.getProfile();
      const profile = profileResponse.data;
      const sport = SPORTS.find(s => s.id === profile.primary_sport);

      const athleteData = {
        weight: profile.weight_kg,
        height: profile.height_cm,
        age: profile.age,
        gender: profile.gender,
        bodyFat: null,
        activityLevel: 'moderate',
        trainingPhase: profile.training_phase,
      };

      const macros = {
        bmr: profile.bmr,
        tdee: profile.tdee,
        trainingDay: {
          calories: profile.training_day_calories,
          protein: profile.training_day_protein_g,
          carbs: profile.training_day_carbs_g,
          fat: profile.training_day_fat_g,
        },
        restDay: {
          calories: profile.rest_day_calories,
          protein: profile.rest_day_protein_g,
          carbs: profile.rest_day_carbs_g,
          fat: profile.rest_day_fat_g,
        },
        macroRatios: sport?.macroRatio || { protein: 20, carbs: 55, fat: 25 },
      };

      navigation.replace('Home', {
        screen: 'HomeTab',
        params: {
          athleteData,
          macros,
          sport: sport || { id: profile.primary_sport, name: profile.primary_sport, icon: '🏃' }
        }
      });

    } catch (error) {
      if (error.response?.status === 404) {
        navigation.replace('SportSelection');
      } else {
        await AsyncStorage.removeItem('token');
        navigation.replace('Login');
      }
    }
  };

  return (
    <View style={styles.container}>

      {/* BACKGROUND GRID */}
      <View style={styles.grid} />

      {/* ANIMATED CONTENT */}
      <Animated.View style={[
        styles.content,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
      ]}>

        {/* LOGO */}
        <View style={styles.logoContainer}>
          <View style={styles.logoGlow} />
          <Text style={styles.logoIcon}>⚡</Text>
        </View>

        {/* TITLE */}
        <Text style={styles.title}>APEX</Text>
        <Text style={styles.titleSub}>NUTRITION</Text>

        {/* TAGLINE */}
        <View style={styles.taglineBadge}>
          <View style={styles.taglineDot} />
          <Text style={styles.taglineText}>AI × Sport Science</Text>
        </View>

        {/* STATS ROW */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>24</Text>
            <Text style={styles.statLabel}>SPORTS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>6</Text>
            <Text style={styles.statLabel}>PHASES</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>300k+</Text>
            <Text style={styles.statLabel}>FOODS</Text>
          </View>
        </View>

        {/* LOADER */}
        <View style={styles.loaderRow}>
          <ActivityIndicator size="small" color={DT.lime} />
          <Text style={styles.loaderText}>Loading your profile...</Text>
        </View>

      </Animated.View>

      {/* BOTTOM TAGLINE */}
      <Animated.Text style={[styles.bottomText, { opacity: fadeAnim }]}>
        Nutrition built for <Text style={{ color: DT.lime }}>athletes who win.</Text>
      </Animated.Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DT.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  // BACKGROUND GRID (subtle)
  grid: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.03,
    backgroundColor: 'transparent',
  },

  // CONTENT
  content: {
    alignItems: 'center',
    width: '100%',
  },

  // LOGO
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: DT.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: DT.limeDim,
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: DT.lime,
    opacity: 0.08,
  },
  logoIcon: {
    fontSize: 44,
  },

  // TITLE
  title: {
    fontSize: 52,
    fontWeight: '800',
    color: DT.text,
    letterSpacing: 8,
    lineHeight: 56,
  },
  titleSub: {
    fontSize: 20,
    fontWeight: '700',
    color: DT.textSec,
    letterSpacing: 6,
    marginBottom: 24,
  },

  // TAGLINE BADGE
  taglineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(203,255,71,0.3)',
    backgroundColor: 'rgba(203,255,71,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 32,
  },
  taglineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DT.lime,
  },
  taglineText: {
    fontSize: 12,
    color: DT.lime,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // STATS
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 48,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: DT.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DT.border,
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center' },
  statNum: {
    fontSize: 24,
    fontWeight: '800',
    color: DT.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 9,
    color: DT.textSec,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: DT.border,
  },

  // LOADER
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loaderText: {
    fontSize: 13,
    color: DT.textSec,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  // BOTTOM
  bottomText: {
    position: 'absolute',
    bottom: 48,
    fontSize: 14,
    color: DT.textSec,
    fontWeight: '500',
    textAlign: 'center',
  },
});