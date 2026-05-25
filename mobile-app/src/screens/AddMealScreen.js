import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function AddMealScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Add Meal</Text>
        <Text style={styles.subtitle}>Log your nutrition</Text>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionCard}>
            <Text style={styles.optionIcon}>📸</Text>
            <Text style={styles.optionTitle}>Photo Recognition</Text>
            <Text style={styles.optionSubtitle}>AI-powered food detection</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard}>
            <Text style={styles.optionIcon}>🔍</Text>
            <Text style={styles.optionTitle}>Search Food</Text>
            <Text style={styles.optionSubtitle}>Manual entry from database</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard}>
            <Text style={styles.optionIcon}>✏️</Text>
            <Text style={styles.optionTitle}>Quick Add</Text>
            <Text style={styles.optionSubtitle}>Enter macros directly</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>🚀 Coming in Phase 2</Text>
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
    paddingTop: SPACING.xl * 2,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  optionsContainer: {
    gap: SPACING.md,
  },
  optionCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  optionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  optionSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  comingSoon: {
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: '#E3F2FD',
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
});