import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function FoodSearchModal({ visible, onClose, mealType, onAddFood }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [weight, setWeight] = useState('');

  const searchFood = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/food/search`, {
        params: { query: searchQuery }
      });
      setSearchResults(response.data.foods);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const selectFood = async (food) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/food/details/${food.fdc_id}`);
      setSelectedFood(response.data);
      setWeight('100'); // Default to 100g
    } catch (error) {
      console.error('Details error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMacros = () => {
    if (!selectedFood || !weight) return null;

    const ratio = parseFloat(weight) / selectedFood.serving_size;
    
    return {
      calories: Math.round(selectedFood.calories * ratio),
      protein: Math.round(selectedFood.protein * ratio),
      carbs: Math.round(selectedFood.carbs * ratio),
      fat: Math.round(selectedFood.fat * ratio),
    };
  };

  const handleAddFood = () => {
    const macros = calculateMacros();
    if (!macros) return;

    onAddFood({
      name: selectedFood.description,
      weight: parseFloat(weight),
      ...macros,
      mealType,
    });

    // Reset and close
    setSearchQuery('');
    setSearchResults([]);
    setSelectedFood(null);
    setWeight('');
    onClose();
  };

  const macros = calculateMacros();

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add to {mealType}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search Section */}
          {!selectedFood && (
            <>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search food (e.g., chicken breast)"
                  placeholderTextColor={COLORS.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={searchFood}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity 
                    style={styles.clearButton} 
                    onPress={clearSearch}
                  >
                    <Text style={styles.clearButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.searchButton} onPress={searchFood}>
                  <Text style={styles.searchButtonText}>🔍</Text>
                </TouchableOpacity>
              </View>

              {/* Search Results */}
              {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
              ) : (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.fdc_id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.resultItem}
                      onPress={() => selectFood(item)}
                    >
                      <Text style={styles.resultName}>{item.description}</Text>
                      {item.brand_owner && (
                        <Text style={styles.resultBrand}>{item.brand_owner}</Text>
                      )}
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>
                      {searchQuery ? 'No results found' : 'Search for a food to get started'}
                    </Text>
                  }
                />
              )}
            </>
          )}

          {/* Selected Food Details */}
          {selectedFood && (
            <View style={styles.detailsContainer}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setSelectedFood(null)}
              >
                <Text style={styles.backButtonText}>← Back to search</Text>
              </TouchableOpacity>

              <Text style={styles.foodName}>{selectedFood.description}</Text>

              {/* Weight Input */}
              <View style={styles.weightContainer}>
                <Text style={styles.label}>Weight (grams)</Text>
                <TextInput
                  style={styles.weightInput}
                  placeholder="100"
                  placeholderTextColor={COLORS.textSecondary}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
              </View>

              {/* Calculated Macros */}
              {macros && (
                <View style={styles.macrosPreview}>
                  <Text style={styles.macrosTitle}>Nutrition for {weight}g:</Text>
                  <View style={styles.macroRow}>
                    <Text style={styles.macroLabel}>Calories:</Text>
                    <Text style={styles.macroValue}>{macros.calories} cal</Text>
                  </View>
                  <View style={styles.macroRow}>
                    <Text style={styles.macroLabel}>Protein:</Text>
                    <Text style={styles.macroValue}>{macros.protein}g</Text>
                  </View>
                  <View style={styles.macroRow}>
                    <Text style={styles.macroLabel}>Carbs:</Text>
                    <Text style={styles.macroValue}>{macros.carbs}g</Text>
                  </View>
                  <View style={styles.macroRow}>
                    <Text style={styles.macroLabel}>Fat:</Text>
                    <Text style={styles.macroValue}>{macros.fat}g</Text>
                  </View>
                </View>
              )}

              {/* Add Button */}
              <TouchableOpacity
                style={[styles.addButton, !weight && styles.addButtonDisabled]}
                onPress={handleAddFood}
                disabled={!weight}
              >
                <Text style={styles.addButtonText}>Add to {mealType}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    fontSize: FONTS.sizes.xxl,
    color: COLORS.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    paddingRight: 80, // Make room for clear + search buttons
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearButton: {
    position: 'absolute',
    right: 60,
    top: 0,
    bottom: 0,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 20,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  searchButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  searchButtonText: {
    fontSize: FONTS.sizes.xl,
  },
  loader: {
    marginTop: SPACING.xl,
  },
  resultItem: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  resultBrand: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: SPACING.xl,
    fontSize: FONTS.sizes.md,
  },
  detailsContainer: {
    flex: 1,
  },
  backButton: {
    marginBottom: SPACING.md,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
  },
  foodName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  weightContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  weightInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  macrosPreview: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  macrosTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  macroLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  macroValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
});