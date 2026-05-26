import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { athleteAPI } from '../services/api';
import { SPORTS } from '../constants/sports';
import { COLORS, FONTS, SPACING } from '../constants/theme';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if token exists
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        // No token - go to login
        navigation.replace('Login');
        return;
      }

      // Token exists - try to fetch profile
      const profileResponse = await athleteAPI.getProfile();
      const profile = profileResponse.data;

      // Find the sport object
      const sport = SPORTS.find(s => s.id === profile.primary_sport);

      // Build athleteData and macros from profile
      const athleteData = {
        weight: profile.weight_kg,
        height: profile.height_cm,
        age: profile.age,
        gender: profile.gender,
        bodyFat: null,
        activityLevel: 'moderate', // Default (we don't save this yet)
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

      // Profile exists - go to Home with data
      navigation.replace('Home', {
        screen: 'HomeTab',
        params: { athleteData, macros, sport: sport || { id: profile.primary_sport, name: profile.primary_sport, icon: '🏃' } }
      });

    } catch (error) {
      console.log('Profile check error:', error.response?.status);
      
      if (error.response?.status === 404) {
        // Token valid but no profile - go to sport selection
        navigation.replace('SportSelection');
      } else {
        // Invalid token or other error - go to login
        await AsyncStorage.removeItem('token');
        navigation.replace('Login');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🏃‍♂️</Text>
      <Text style={styles.title}>Apex Nutrition</Text>
      <Text style={styles.subtitle}>Elite Athlete Nutrition</Text>
      <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  loader: {
    marginTop: SPACING.xl,
  },
});