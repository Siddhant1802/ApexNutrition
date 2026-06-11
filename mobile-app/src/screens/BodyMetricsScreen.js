import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { showToast } from '../components/Toast';
import { TRAINING_PHASES } from '../constants/sports';
import { calculateMacros } from '../utils/macroCalculator';
import { athleteAPI } from '../services/api';
import { DT } from '../constants/darkTheme';

export default function BodyMetricsScreen({ route, navigation }) {
  const { sport } = route.params;

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [bodyFat, setBodyFat] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [trainingPhase, setTrainingPhase] = useState('inseason');
  const [loading, setLoading] = useState(false);

  const activityLevels = [
    { id: 'sedentary', name: 'Sedentary', desc: 'Little or no exercise', multiplier: 1.2 },
    { id: 'light', name: 'Light', desc: '1-3 days/week', multiplier: 1.375 },
    { id: 'moderate', name: 'Moderate', desc: '3-5 days/week', multiplier: 1.55 },
    { id: 'active', name: 'Active', desc: '6-7 days/week', multiplier: 1.725 },
    { id: 'extreme', name: 'Very Active', desc: 'Twice per day', multiplier: 1.9 },
  ];

  const handleSubmit = async () => {
    if (!weight || !height || !age) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    if (parseFloat(weight) <= 0 || parseFloat(height) <= 0 || parseFloat(age) <= 0) {
      showToast('Please enter valid values', 'error');
      return;
    }

    const athleteData = {
      weight: parseFloat(weight),
      height: parseFloat(height),
      age: parseInt(age),
      gender,
      bodyFat: bodyFat ? parseFloat(bodyFat) : null,
      activityLevel,
      trainingPhase,
    };

    const macros = calculateMacros(athleteData, sport);

    const profileData = {
      sport: sport.id,
      weight: athleteData.weight,
      height: athleteData.height,
      age: athleteData.age,
      gender: athleteData.gender,
      body_fat: athleteData.bodyFat,
      activity_level: athleteData.activityLevel,
      training_phase: athleteData.trainingPhase,
      bmr: macros.bmr,
      tdee: macros.tdee,
      training_day_calories: macros.trainingDay.calories,
      training_day_protein: macros.trainingDay.protein,
      training_day_carbs: macros.trainingDay.carbs,
      training_day_fat: macros.trainingDay.fat,
      rest_day_calories: macros.restDay.calories,
      rest_day_protein: macros.restDay.protein,
      rest_day_carbs: macros.restDay.carbs,
      rest_day_fat: macros.restDay.fat,
      macro_ratio_protein: macros.macroRatios.protein,
      macro_ratio_carbs: macros.macroRatios.carbs,
      macro_ratio_fat: macros.macroRatios.fat,
    };

    setLoading(true);
    try {
      await athleteAPI.createOrUpdateProfile(profileData);
      showToast('Profile saved successfully!', 'success');
      setTimeout(() => {
        navigation.replace('Home', {
          screen: 'HomeTab',
          params: { athleteData, macros, sport }
        });
      }, 1500);
    } catch (error) {
      showToast('Could not save profile. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.headerBadge}>
            <View style={styles.headerBadgeDot} />
            <Text style={styles.headerBadgeText}>Step 2 of 2</Text>
          </View>

          <Text style={styles.title}>Your Body Metrics</Text>
          <Text style={styles.subtitle}>
            We'll calculate personalized macros for your sport
          </Text>

          {/* SPORT SELECTED */}
          <View style={styles.sportSelected}>
            <Text style={styles.sportSelectedIcon}>{sport.icon}</Text>
            <View>
              <Text style={styles.sportSelectedLabel}>SELECTED SPORT</Text>
              <Text style={styles.sportSelectedName}>{sport.name}</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.sportChangeBtn}
            >
              <Text style={styles.sportChangeBtnText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FORM */}
        <View style={styles.form}>

          {/* BASIC METRICS CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📏 Basic Metrics</Text>

            {/* WEIGHT */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>WEIGHT</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="70"
                  placeholderTextColor={DT.textTert}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                />
                <View style={styles.inputUnit}>
                  <Text style={styles.inputUnitText}>kg</Text>
                </View>
              </View>
            </View>

            {/* HEIGHT */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>HEIGHT</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="175"
                  placeholderTextColor={DT.textTert}
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="decimal-pad"
                />
                <View style={styles.inputUnit}>
                  <Text style={styles.inputUnitText}>cm</Text>
                </View>
              </View>
            </View>

            {/* AGE */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>AGE</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="25"
                  placeholderTextColor={DT.textTert}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                />
                <View style={styles.inputUnit}>
                  <Text style={styles.inputUnitText}>yrs</Text>
                </View>
              </View>
            </View>

            {/* BODY FAT */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>BODY FAT % <Text style={styles.optional}>(OPTIONAL)</Text></Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="15"
                  placeholderTextColor={DT.textTert}
                  value={bodyFat}
                  onChangeText={setBodyFat}
                  keyboardType="decimal-pad"
                />
                <View style={styles.inputUnit}>
                  <Text style={styles.inputUnitText}>%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* GENDER CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⚧ Gender</Text>
            <Text style={styles.cardSubtitle}>Used for BMR calculation</Text>
            <View style={styles.genderRow}>
              {['male', 'female'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                  onPress={() => setGender(g)}
                >
                  <Text style={styles.genderEmoji}>{g === 'male' ? '♂️' : '♀️'}</Text>
                  <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ACTIVITY LEVEL CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⚡ Activity Level</Text>
            <Text style={styles.cardSubtitle}>How active are you on a typical week?</Text>
            <View style={styles.optionsList}>
              {activityLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[styles.optionCard, activityLevel === level.id && styles.optionCardActive]}
                  onPress={() => setActivityLevel(level.id)}
                >
                  <View style={styles.optionCardLeft}>
                    <View style={[
                      styles.optionRadio,
                      activityLevel === level.id && styles.optionRadioActive
                    ]}>
                      {activityLevel === level.id && (
                        <View style={styles.optionRadioInner} />
                      )}
                    </View>
                    <View>
                      <Text style={[styles.optionCardName, activityLevel === level.id && styles.optionCardNameActive]}>
                        {level.name}
                      </Text>
                      <Text style={styles.optionCardDesc}>{level.desc}</Text>
                    </View>
                  </View>
                  <Text style={[styles.optionMultiplier, activityLevel === level.id && { color: DT.lime }]}>
                    ×{level.multiplier}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* TRAINING PHASE CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📅 Training Phase</Text>
            <Text style={styles.cardSubtitle}>Where are you in your training cycle?</Text>
            <View style={styles.optionsList}>
              {TRAINING_PHASES.map((phase) => (
                <TouchableOpacity
                  key={phase.id}
                  style={[styles.optionCard, trainingPhase === phase.id && styles.optionCardActive]}
                  onPress={() => setTrainingPhase(phase.id)}
                >
                  <View style={styles.optionCardLeft}>
                    <View style={[
                      styles.optionRadio,
                      trainingPhase === phase.id && styles.optionRadioActive
                    ]}>
                      {trainingPhase === phase.id && (
                        <View style={styles.optionRadioInner} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.optionCardName, trainingPhase === phase.id && styles.optionCardNameActive]}>
                        {phase.name}
                      </Text>
                      <Text style={styles.optionCardDesc}>{phase.description}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={DT.bg} size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Calculate My Macros →</Text>
            )}
          </TouchableOpacity>

          {/* SCIENCE NOTE */}
          <View style={styles.scienceNote}>
            <Text style={styles.scienceNoteIcon}>🔬</Text>
            <Text style={styles.scienceNoteText}>
              Macros calculated using the Mifflin-St Jeor formula with sport-specific periodization ratios
            </Text>
          </View>

        </View>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DT.bg },
  content: { paddingHorizontal: 20 },

  // HEADER
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: DT.border,
    marginBottom: 16,
  },
  backBtn: { marginBottom: 16, alignSelf: 'flex-start' },
  backBtnText: { fontSize: 14, color: DT.lime, fontWeight: '600' },
  headerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(203,255,71,0.3)',
    backgroundColor: 'rgba(203,255,71,0.08)',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, alignSelf: 'flex-start', marginBottom: 12,
  },
  headerBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: DT.lime },
  headerBadgeText: { fontSize: 11, color: DT.lime, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: DT.text, letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontSize: 14, color: DT.textSec, lineHeight: 20, marginBottom: 16 },

  // SPORT SELECTED
  sportSelected: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: DT.card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: DT.border,
  },
  sportSelectedIcon: { fontSize: 32 },
  sportSelectedLabel: { fontSize: 9, color: DT.textSec, fontWeight: '700', letterSpacing: 1.5 },
  sportSelectedName: { fontSize: 16, fontWeight: '700', color: DT.text, marginTop: 2 },
  sportChangeBtn: {
    marginLeft: 'auto', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, borderColor: DT.border,
  },
  sportChangeBtnText: { fontSize: 12, color: DT.textSec, fontWeight: '500' },

  // FORM
  form: { paddingBottom: 20 },

  // CARD
  card: {
    backgroundColor: DT.card, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: DT.border, marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: DT.text, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: DT.textSec, marginBottom: 16 },

  // INPUTS
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 9, color: DT.textSec, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  optional: { color: DT.textTert, fontWeight: '500' },
  inputRow: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1, backgroundColor: DT.cardAlt, borderRadius: 12,
    padding: 14, fontSize: 16, color: DT.text,
    borderWidth: 1, borderColor: DT.border, fontWeight: '600',
  },
  inputUnit: {
    width: 52, backgroundColor: DT.cardAlt, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: DT.border,
  },
  inputUnitText: { fontSize: 13, color: DT.textSec, fontWeight: '600' },

  // GENDER
  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: {
    flex: 1, backgroundColor: DT.cardAlt, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
    borderWidth: 1, borderColor: DT.border, gap: 6,
  },
  genderBtnActive: { backgroundColor: DT.limeDim, borderColor: DT.lime },
  genderEmoji: { fontSize: 24 },
  genderText: { fontSize: 14, fontWeight: '600', color: DT.textSec },
  genderTextActive: { color: DT.lime },

  // OPTIONS
  optionsList: { gap: 8 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: DT.cardAlt, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: DT.border,
  },
  optionCardActive: { backgroundColor: 'rgba(203,255,71,0.06)', borderColor: 'rgba(203,255,71,0.3)' },
  optionCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  optionRadio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: DT.border,
    justifyContent: 'center', alignItems: 'center',
  },
  optionRadioActive: { borderColor: DT.lime },
  optionRadioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: DT.lime },
  optionCardName: { fontSize: 14, fontWeight: '600', color: DT.text },
  optionCardNameActive: { color: DT.lime },
  optionCardDesc: { fontSize: 12, color: DT.textSec, marginTop: 2 },
  optionMultiplier: { fontSize: 13, fontWeight: '700', color: DT.textTert },

  // SUBMIT
  submitBtn: {
    backgroundColor: DT.lime, borderRadius: 14,
    height: 56, alignItems: 'center', justifyContent: 'center',
    marginTop: 8, marginBottom: 16,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: 16, fontWeight: '800', color: DT.bg, letterSpacing: 0.5 },

  // SCIENCE NOTE
  scienceNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: DT.card, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: DT.border,
  },
  scienceNoteIcon: { fontSize: 16 },
  scienceNoteText: { flex: 1, fontSize: 12, color: DT.textSec, lineHeight: 18 },
});