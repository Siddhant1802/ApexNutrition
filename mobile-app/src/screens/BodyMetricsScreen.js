import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { showToast } from '../components/Toast';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { TRAINING_PHASES } from '../constants/sports';
import { calculateMacros } from '../utils/macroCalculator';

export default function BodyMetricsScreen({ route, navigation }) {
  const { sport } = route.params;

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [bodyFat, setBodyFat] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [trainingPhase, setTrainingPhase] = useState('inseason');

  const activityLevels = [
    { id: 'sedentary', name: 'Sedentary', multiplier: 1.2 },
    { id: 'light', name: 'Light (1-3 days/week)', multiplier: 1.375 },
    { id: 'moderate', name: 'Moderate (3-5 days/week)', multiplier: 1.55 },
    { id: 'active', name: 'Active (6-7 days/week)', multiplier: 1.725 },
    { id: 'extreme', name: 'Very Active (2x/day)', multiplier: 1.9 },
  ];

  const handleSubmit = () => {
    // Validation
    if (!weight || !height || !age) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (parseFloat(weight) <= 0 || parseFloat(height) <= 0 || parseFloat(age) <= 0) {
      showToast('Please enter valid values', 'error');
      return;
    }

    // Athlete data
    const athleteData = {
      weight: parseFloat(weight),
      height: parseFloat(height),
      age: parseInt(age),
      gender,
      bodyFat: bodyFat ? parseFloat(bodyFat) : null,
      activityLevel,
      trainingPhase,
    };

    // Calculate macros
    const macros = calculateMacros(athleteData, sport);

    console.log('Calculated Macros:', macros);
    showToast('Macros calculated successfully!', 'success');

// Navigate to Home Dashboard
setTimeout(() => {
  navigation.replace('Home', { athleteData, macros, sport });
}, 1500);

  
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Body Metrics</Text>
          <Text style={styles.subtitle}>
            Selected Sport: {sport.icon} {sport.name}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Weight */}
          <Text style={styles.label}>Weight (kg) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 70"
            placeholderTextColor={COLORS.textSecondary}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
          />

          {/* Height */}
          <Text style={styles.label}>Height (cm) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 175"
            placeholderTextColor={COLORS.textSecondary}
            value={height}
            onChangeText={setHeight}
            keyboardType="decimal-pad"
          />

          {/* Age */}
          <Text style={styles.label}>Age *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 25"
            placeholderTextColor={COLORS.textSecondary}
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
          />

          {/* Gender */}
          <Text style={styles.label}>Gender</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.optionButton, gender === 'male' && styles.optionButtonActive]}
              onPress={() => setGender('male')}
            >
              <Text style={[styles.optionText, gender === 'male' && styles.optionTextActive]}>
                Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, gender === 'female' && styles.optionButtonActive]}
              onPress={() => setGender('female')}
            >
              <Text style={[styles.optionText, gender === 'female' && styles.optionTextActive]}>
                Female
              </Text>
            </TouchableOpacity>
          </View>

          {/* Body Fat (Optional) */}
          <Text style={styles.label}>Body Fat % (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 15"
            placeholderTextColor={COLORS.textSecondary}
            value={bodyFat}
            onChangeText={setBodyFat}
            keyboardType="decimal-pad"
          />

          {/* Activity Level */}
          <Text style={styles.label}>Activity Level</Text>
          {activityLevels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.optionCard,
                activityLevel === level.id && styles.optionCardActive,
              ]}
              onPress={() => setActivityLevel(level.id)}
            >
              <Text
                style={[
                  styles.optionCardText,
                  activityLevel === level.id && styles.optionCardTextActive,
                ]}
              >
                {level.name}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Training Phase */}
          <Text style={styles.label}>Training Phase</Text>
          {TRAINING_PHASES.map((phase) => (
            <TouchableOpacity
              key={phase.id}
              style={[
                styles.optionCard,
                trainingPhase === phase.id && styles.optionCardActive,
              ]}
              onPress={() => setTrainingPhase(phase.id)}
            >
              <Text
                style={[
                  styles.optionCardText,
                  trainingPhase === phase.id && styles.optionCardTextActive,
                ]}
              >
                {phase.name}
              </Text>
              <Text style={styles.optionCardDescription}>{phase.description}</Text>
            </TouchableOpacity>
          ))}

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Calculate My Macros</Text>
          </TouchableOpacity>
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
    marginBottom: SPACING.xl,
    paddingTop: SPACING.xl,
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
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  optionButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  optionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionCardText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  optionCardTextActive: {
    color: '#FFFFFF',
  },
  optionCardDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
});