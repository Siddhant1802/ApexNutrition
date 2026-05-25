import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function ProfileScreen({ navigation }) {
  const handleSignOut = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Login');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account</Text>

        {/* Profile Options */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.optionCard}>
            <Text style={styles.optionIcon}>👤</Text>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Edit Profile</Text>
              <Text style={styles.optionSubtitle}>Update personal information</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard}>
            <Text style={styles.optionIcon}>📊</Text>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Body Metrics</Text>
              <Text style={styles.optionSubtitle}>Update weight, height, activity</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard}>
            <Text style={styles.optionIcon}>⚽</Text>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Change Sport</Text>
              <Text style={styles.optionSubtitle}>Switch to different sport</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard}>
            <Text style={styles.optionIcon}>⚙️</Text>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Settings</Text>
              <Text style={styles.optionSubtitle}>Preferences and notifications</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Apex Nutrition v1.0.0</Text>
          <Text style={styles.footerText}>Elite Athlete Nutrition</Text>
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
  section: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },
  optionSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  arrow: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  signOutButton: {
    backgroundColor: '#FFEBEE',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  signOutText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: '#D32F2F',
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
});