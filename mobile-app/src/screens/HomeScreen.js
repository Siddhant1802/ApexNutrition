import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mealsAPI } from '../services/api';
import FoodSearchModal from '../components/FoodSearchModal';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function HomeScreen({ route, navigation }) {
  const { athleteData, macros, sport } = route.params;
  
  const [isTrainingDay, setIsTrainingDay] = useState(true);
  const [consumed, setConsumed] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  
  const [meals, setMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  });
  
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [currentMealType, setCurrentMealType] = useState('');
  const [loading, setLoading] = useState(true);

  const targets = isTrainingDay ? macros.trainingDay : macros.restDay;

  // Load today's meals on mount
  useEffect(() => {
    loadTodaysMeals();
  }, []);

  const loadTodaysMeals = async () => {
    try {
      const response = await mealsAPI.getToday();
      const loadedMeals = response.data;
      
      // Group meals by type
      const groupedMeals = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
      };
      
      let totalConsumed = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
      
      loadedMeals.forEach(meal => {
        const mealData = {
          id: meal.id,
          name: meal.food_name,
          weight: meal.weight_grams,
          calories: meal.calories,
          protein: meal.protein_g,
          carbs: meal.carbs_g,
          fat: meal.fat_g,
          mealType: meal.meal_type,
        };
        
        groupedMeals[meal.meal_type].push(mealData);
        
        totalConsumed.calories += meal.calories;
        totalConsumed.protein += meal.protein_g;
        totalConsumed.carbs += meal.carbs_g;
        totalConsumed.fat += meal.fat_g;
      });
      
      setMeals(groupedMeals);
      setConsumed(totalConsumed);
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
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

  const openFoodModal = (mealType) => {
    setCurrentMealType(mealType);
    setShowFoodModal(true);
  };

  const handleAddFood = async (foodData) => {
    try {
      // Save to database
      const response = await mealsAPI.create({
        meal_type: foodData.mealType,
        food_name: foodData.name,
        weight_grams: foodData.weight,
        calories: foodData.calories,
        protein_g: foodData.protein,
        carbs_g: foodData.carbs,
        fat_g: foodData.fat,
      });

      // Add database ID to foodData
      const savedMeal = {
        ...foodData,
        id: response.data.id,
      };

      // Add food to meals state
      setMeals(prev => ({
        ...prev,
        [foodData.mealType]: [...prev[foodData.mealType], savedMeal]
      }));

      // Update consumed macros
      const newConsumed = {
        calories: consumed.calories + foodData.calories,
        protein: consumed.protein + foodData.protein,
        carbs: consumed.carbs + foodData.carbs,
        fat: consumed.fat + foodData.fat,
      };
      setConsumed(newConsumed);
    } catch (error) {
      console.error('Error saving meal:', error);
      alert('Failed to save meal. Please try again.');
    }
  };

  const getMealCalories = (mealType) => {
    return meals[mealType].reduce((sum, food) => sum + food.calories, 0);
  };

  const deleteMeal = async (mealType, index) => {
    const foodToDelete = meals[mealType][index];
    
    try {
      // Delete from database
      await mealsAPI.delete(foodToDelete.id);

      // Remove from meals state
      setMeals(prev => ({
        ...prev,
        [mealType]: prev[mealType].filter((_, i) => i !== index)
      }));

      // Update consumed macros
      const newConsumed = {
        calories: consumed.calories - foodToDelete.calories,
        protein: consumed.protein - foodToDelete.protein,
        carbs: consumed.carbs - foodToDelete.carbs,
        fat: consumed.fat - foodToDelete.fat,
      };
      setConsumed(newConsumed);
    } catch (error) {
      console.error('Error deleting meal:', error);
      alert('Failed to delete meal. Please try again.');
    }
  };

  const renderMealCard = (mealType, icon, label) => {
    const mealItems = meals[mealType];
    const totalCalories = getMealCalories(mealType);

    return (
      <View style={styles.mealCardContainer} key={mealType}>
        <View style={styles.mealCardHeader}>
          <View style={styles.mealHeaderLeft}>
            <Text style={styles.mealIcon}>{icon}</Text>
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>{label}</Text>
              <Text style={styles.mealCalories}>{totalCalories} cal</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => openFoodModal(mealType)}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Food Items */}
        {mealItems.map((food, index) => (
          <View key={food.id || index} style={styles.foodItem}>
            <View style={styles.foodItemLeft}>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.foodMacros}>
                P: {food.protein}g  C: {food.carbs}g  F: {food.fat}g  •  {food.weight}g
              </Text>
            </View>
            <View style={styles.foodItemRight}>
              <Text style={styles.foodCalories}>{food.calories} cal</Text>
              <TouchableOpacity 
                onPress={() => deleteMeal(mealType, index)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your meals...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning!</Text>
            <Text style={styles.sport}>{sport.icon} {sport.name}</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
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
          {renderMealCard('breakfast', '🍳', 'Breakfast')}
          {renderMealCard('lunch', '🍱', 'Lunch')}
          {renderMealCard('dinner', '🍝', 'Dinner')}
          {renderMealCard('snacks', '🍿', 'Snacks')}
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

      {/* Food Search Modal */}
      <FoodSearchModal
        visible={showFoodModal}
        onClose={() => setShowFoodModal(false)}
        mealType={currentMealType}
        onAddFood={handleAddFood}
      />
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
  mealCardContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  mealCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  mealHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  foodItemLeft: {
    flex: 1,
  },
  foodName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  foodMacros: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  foodItemRight: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  foodCalories: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  deleteButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
    color: COLORS.textSecondary,
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