import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';

export default function ProgressScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>Track your nutrition journey</Text>
        
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>📊</Text>
          <Text style={styles.placeholderTitle}>Coming Soon</Text>
          <Text style={styles.placeholderSubtitle}>
            Weekly charts, adherence tracking, and performance trends
          </Text>
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
  placeholder: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl * 2,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  placeholderText: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  placeholderTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  placeholderSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});