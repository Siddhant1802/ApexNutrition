import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { athleteAPI } from '../services/api';
import { SPORTS } from '../constants/sports';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function ProfileScreen({ navigation, route }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showSportModal, setShowSportModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await athleteAPI.getProfile();
      setProfile(response.data);
      setNewWeight(response.data.weight_kg.toString());
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleUpdateWeight = async () => {
    const weight = parseFloat(newWeight);
    if (!weight || weight <= 0) {
      alert('Please enter a valid weight');
      return;
    }

    setLoading(true);
    try {
      // Re-calculate macros with new weight
      const updatedData = {
        sport: profile.primary_sport,
        weight: weight,
        height: profile.height_cm,
        age: profile.age,
        gender: profile.gender,
        activityLevel: 'moderate',
        trainingPhase: profile.training_phase,
      };

      // Calculate new macros (simplified - using Mifflin-St Jeor)
      let bmr;
      if (profile.gender === 'male') {
        bmr = Math.round(10 * weight + 6.25 * profile.height_cm - 5 * profile.age + 5);
      } else {
        bmr = Math.round(10 * weight + 6.25 * profile.height_cm - 5 * profile.age - 161);
      }

      const activityMultiplier = 1.55; // Moderate activity
      const tdee = Math.round(bmr * activityMultiplier);

      // Calculate macros (simplified ratios)
      const trainingCalories = tdee + 200;
      const restCalories = tdee - 200;

      const sport = SPORTS.find(s => s.id === profile.primary_sport);
      const macroRatio = sport?.macroRatio || { protein: 20, carbs: 55, fat: 25 };

      // Calculate grams for training day
      const trainingProtein = Math.round((trainingCalories * (macroRatio.protein / 100)) / 4);
      const trainingCarbs = Math.round((trainingCalories * (macroRatio.carbs / 100)) / 4);
      const trainingFat = Math.round((trainingCalories * (macroRatio.fat / 100)) / 9);

      // Calculate grams for rest day
      const restProtein = Math.round((restCalories * (macroRatio.protein / 100)) / 4);
      const restCarbs = Math.round((restCalories * (macroRatio.carbs / 100)) / 4);
      const restFat = Math.round((restCalories * (macroRatio.fat / 100)) / 9);

      const updatePayload = {
  sport: profile.primary_sport,
  weight: weight,
  height: profile.height_cm,
  age: profile.age,
  gender: profile.gender,
  body_fat: profile.body_fat || null,  // ADD THIS LINE
  activity_level: 'moderate',  // CHANGE TO SNAKE_CASE
  training_phase: profile.training_phase || 'base',  // CHANGE TO SNAKE_CASE
  bmr: bmr,
  tdee: tdee,
  training_day_calories: trainingCalories,
  training_day_protein: trainingProtein,
  training_day_carbs: trainingCarbs,
  training_day_fat: trainingFat,
  rest_day_calories: restCalories,
  rest_day_protein: restProtein,
  rest_day_carbs: restCarbs,
  rest_day_fat: restFat,
  macro_ratio_protein: macroRatio.protein,
  macro_ratio_carbs: macroRatio.carbs,
  macro_ratio_fat: macroRatio.fat,
};
      console.log('Sending payload:', updatePayload);

      await athleteAPI.updateProfile(updatePayload);
      await loadProfile();
      setShowWeightModal(false);
      alert('Weight updated successfully! Macros recalculated.');
    } catch (error) {
      console.error('Error updating weight:', error);
      alert('Failed to update weight. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Failed to load profile</Text>
      </View>
    );
  }

  const sport = SPORTS.find(s => s.id === profile.primary_sport);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Info Card */}
        <View style={styles.card}>
          <View style={styles.sportHeader}>
            <Text style={styles.sportIcon}>{sport?.icon || '🏃'}</Text>
            <Text style={styles.sportName}>{sport?.name || profile.primary_sport}</Text>
          </View>
        </View>

        {/* Body Metrics */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Body Metrics</Text>
          
          <View style={styles.metricRow}>
            <View style={styles.metricLeft}>
              <Text style={styles.metricLabel}>Weight</Text>
              <Text style={styles.metricValue}>{profile.weight_kg} kg</Text>
            </View>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setShowWeightModal(true)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricLeft}>
              <Text style={styles.metricLabel}>Height</Text>
              <Text style={styles.metricValue}>{profile.height_cm} cm</Text>
            </View>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricLeft}>
              <Text style={styles.metricLabel}>Age</Text>
              <Text style={styles.metricValue}>{profile.age} years</Text>
            </View>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricLeft}>
              <Text style={styles.metricLabel}>Gender</Text>
              <Text style={styles.metricValue}>
                {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Nutrition Targets */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nutrition Targets</Text>
          
          <View style={styles.targetSection}>
            <Text style={styles.targetLabel}>Training Day</Text>
            <Text style={styles.targetCalories}>{profile.training_day_calories} cal</Text>
            <Text style={styles.targetMacros}>
              P: {profile.training_day_protein_g}g | C: {profile.training_day_carbs_g}g | F: {profile.training_day_fat_g}g
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.targetSection}>
            <Text style={styles.targetLabel}>Rest Day</Text>
            <Text style={styles.targetCalories}>{profile.rest_day_calories} cal</Text>
            <Text style={styles.targetMacros}>
              P: {profile.rest_day_protein_g}g | C: {profile.rest_day_carbs_g}g | F: {profile.rest_day_fat_g}g
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Stats</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>BMR (Basal Metabolic Rate)</Text>
            <Text style={styles.statValue}>{profile.bmr} cal/day</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>TDEE (Total Daily Energy)</Text>
            <Text style={styles.statValue}>{profile.tdee} cal/day</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Training Phase</Text>
            <Text style={styles.statValue}>
              {profile.training_phase?.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Weight Edit Modal */}
      <Modal
        visible={showWeightModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Weight</Text>
              <TouchableOpacity onPress={() => setShowWeightModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>New Weight (kg)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="70"
              placeholderTextColor={COLORS.textSecondary}
              value={newWeight}
              onChangeText={setNewWeight}
              keyboardType="numeric"
            />

            <Text style={styles.modalNote}>
              💡 Updating your weight will recalculate your macros
            </Text>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdateWeight}
            >
              <Text style={styles.saveButtonText}>Update & Recalculate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  signOutButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  signOutText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportIcon: {
    fontSize: 48,
    marginRight: SPACING.md,
  },
  sportName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cardTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  metricLeft: {
    flex: 1,
  },
  metricLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  metricValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  targetSection: {
    paddingVertical: SPACING.sm,
  },
  targetLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  targetCalories: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  targetMacros: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: '85%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    fontSize: FONTS.sizes.xxl,
    color: COLORS.textSecondary,
  },
  modalLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  modalInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  modalNote: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
});