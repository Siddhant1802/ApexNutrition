import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function HomeScreen({ route }) {
  const { athleteData, macros, sport } = route.params;
  
  const [isTrainingDay, setIsTrainingDay] = useState(true);
  const [consumed, setConsumed] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const targets = isTrainingDay ? macros.trainingDay : macros.restDay;

  const getProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good Morning!</Text>
          <Text style={styles.sport}>{sport.icon} {sport.name}</Text>
        </View>

        {/* Training Day Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, isTrainingDay && styles.toggleButtonActive]}
            onPress={() => setIsTrainingDay(true)}
          >
            <Text style={[styles.toggleText, isTrainingDay && styles.toggleTextActive]}>
              Training Day
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, !isTrainingDay && styles.toggleButtonActive]}
            onPress={() => setIsTrainingDay(false)}
          >
            <Text style={[styles.toggleText, !isTrainingDay && styles.toggleTextActive]}>
              Rest Day
            </Text>
          </TouchableOpacity>
        </View>

        {/* Calorie Circle */}
        <View style={styles.calorieCard}>
          <View style={styles.calorieCircle}>
            <Text style={styles.calorieConsumed}>{consumed.calories}</Text>
            <Text style={styles.calorieTarget}>/ {targets.calories} cal</Text>
          </View>
          <Text style={styles.calorieLabel}>Calories Today</Text>
        </View>

        {/* Macro Cards */}
        <View style={styles.macrosContainer}>
          {/* Protein */}
          <View style={[styles.macroCard, { backgroundColor: '#E3F2FD' }]}>
            <Text style={styles.macroIcon}>🥩</Text>
            <Text style={styles.macroName}>Protein</Text>
            <Text style={styles.macroValue}>{consumed.protein}g</Text>
            <Text style={styles.macroTarget}>/ {targets.protein}g</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${getProgress(consumed.protein, targets.protein)}%`, backgroundColor: '#2196F3' }
                ]} 
              />
            </View>
          </View>

          {/* Carbs */}
          <View style={[styles.macroCard, { backgroundColor: '#FFF3E0' }]}>
            <Text style={styles.macroIcon}>🍞</Text>
            <Text style={styles.macroName}>Carbs</Text>
            <Text style={styles.macroValue}>{consumed.carbs}g</Text>
            <Text style={styles.macroTarget}>/ {targets.carbs}g</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${getProgress(consumed.carbs, targets.carbs)}%`, backgroundColor: '#FF9800' }
                ]} 
              />
            </View>
          </View>

          {/* Fats */}
          <View style={[styles.macroCard, { backgroundColor: '#FCE4EC' }]}>
            <Text style={styles.macroIcon}>🥑</Text>
            <Text style={styles.macroName}>Fats</Text>
            <Text style={styles.macroValue}>{consumed.fat}g</Text>
            <Text style={styles.macroTarget}>/ {targets.fat}g</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${getProgress(consumed.fat, targets.fat)}%`, backgroundColor: '#E91E63' }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Today's Meals */}
        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          
          <TouchableOpacity style={styles.mealCard}>
            <Text style={styles.mealIcon}>🍳</Text>
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>Breakfast</Text>
              <Text style={styles.mealCalories}>0 cal</Text>
            </View>
            <Text style={styles.addButton}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mealCard}>
            <Text style={styles.mealIcon}>🍱</Text>
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>Lunch</Text>
              <Text style={styles.mealCalories}>0 cal</Text>
            </View>
            <Text style={styles.addButton}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mealCard}>
            <Text style={styles.mealIcon}>🍝</Text>
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>Dinner</Text>
              <Text style={styles.mealCalories}>0 cal</Text>
            </View>
            <Text style={styles.addButton}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mealCard}>
            <Text style={styles.mealIcon}>🍿</Text>
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>Snacks</Text>
              <Text style={styles.mealCalories}>0 cal</Text>
            </View>
            <Text style={styles.addButton}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>BMR:</Text>
            <Text style={styles.statValue}>{macros.bmr} cal/day</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>TDEE:</Text>
            <Text style={styles.statValue}>{macros.tdee} cal/day</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Weight:</Text>
            <Text style={styles.statValue}>{athleteData.weight} kg</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Activity:</Text>
            <Text style={styles.statValue}>{athleteData.activityLevel}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sport: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  toggleButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  calorieCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calorieCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#4CAF50',
  },
  calorieConsumed: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  calorieTarget: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
  },
  calorieLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  macrosContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  macroCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  macroIcon: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  macroName: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  macroValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  macroTarget: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  mealsSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mealIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  mealCalories: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  addButton: {
    fontSize: 32,
    color: COLORS.primary,
    fontWeight: '300',
  },
  statsCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
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
});