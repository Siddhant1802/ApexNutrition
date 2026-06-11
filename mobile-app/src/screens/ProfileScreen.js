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
import { DT } from '../constants/darkTheme';

export default function ProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => { loadProfile(); }, []);

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
    await AsyncStorage.removeItem('token');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const handleUpdateWeight = async () => {
    const weight = parseFloat(newWeight);
    if (!weight || weight <= 0) {
      alert('Please enter a valid weight');
      return;
    }

    setUpdating(true);
    try {
      let bmr;
      if (profile.gender === 'male') {
        bmr = Math.round(10 * weight + 6.25 * profile.height_cm - 5 * profile.age + 5);
      } else {
        bmr = Math.round(10 * weight + 6.25 * profile.height_cm - 5 * profile.age - 161);
      }

      const tdee = Math.round(bmr * 1.55);
      const trainingCalories = tdee + 200;
      const restCalories = tdee - 200;
      const sport = SPORTS.find(s => s.id === profile.primary_sport);
      const macroRatio = sport?.macroRatio || { protein: 20, carbs: 55, fat: 25 };

      const updatePayload = {
        sport: profile.primary_sport,
        weight,
        height: profile.height_cm,
        age: profile.age,
        gender: profile.gender,
        body_fat: profile.body_fat || null,
        activity_level: 'moderate',
        training_phase: profile.training_phase || 'base',
        bmr,
        tdee,
        training_day_calories: trainingCalories,
        training_day_protein: Math.round((trainingCalories * (macroRatio.protein / 100)) / 4),
        training_day_carbs: Math.round((trainingCalories * (macroRatio.carbs / 100)) / 4),
        training_day_fat: Math.round((trainingCalories * (macroRatio.fat / 100)) / 9),
        rest_day_calories: restCalories,
        rest_day_protein: Math.round((restCalories * (macroRatio.protein / 100)) / 4),
        rest_day_carbs: Math.round((restCalories * (macroRatio.carbs / 100)) / 4),
        rest_day_fat: Math.round((restCalories * (macroRatio.fat / 100)) / 9),
        macro_ratio_protein: macroRatio.protein,
        macro_ratio_carbs: macroRatio.carbs,
        macro_ratio_fat: macroRatio.fat,
      };

      await athleteAPI.updateProfile(updatePayload);
      await loadProfile();
      setShowWeightModal(false);
    } catch (error) {
      alert('Failed to update weight. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={DT.lime} />
        <Text style={styles.loaderText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loader}>
        <Text style={styles.loaderText}>Failed to load profile</Text>
      </View>
    );
  }

  const sport = SPORTS.find(s => s.id === profile.primary_sport);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerMono}>ATHLETE PROFILE</Text>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>

        {/* SPORT CARD */}
        <View style={styles.sportCard}>
          <Text style={styles.sportCardIcon}>{sport?.icon || '🏃'}</Text>
          <View style={styles.sportCardInfo}>
            <Text style={styles.sportCardLabel}>PRIMARY SPORT</Text>
            <Text style={styles.sportCardName}>{sport?.name || profile.primary_sport}</Text>
            <View style={styles.sportCardPhaseBadge}>
              <Text style={styles.sportCardPhaseText}>
                {profile.training_phase?.replace('_', ' ').toUpperCase() || 'BASE'} PHASE
              </Text>
            </View>
          </View>
        </View>

        {/* BODY METRICS CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardIconBadge}>
              <Text>📏</Text>
            </View>
            <Text style={styles.cardTitle}>Body Metrics</Text>
          </View>

          <View style={styles.metricsGrid}>
            {/* Weight - editable */}
            <View style={[styles.metricItem, styles.metricItemFull]}>
              <View style={styles.metricItemLeft}>
                <Text style={styles.metricLabel}>WEIGHT</Text>
                <View style={styles.metricValueRow}>
                  <Text style={styles.metricValue}>{profile.weight_kg}</Text>
                  <Text style={styles.metricUnit}>kg</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setShowWeightModal(true)}
              >
                <Text style={styles.editBtnText}>Edit →</Text>
              </TouchableOpacity>
            </View>

            {/* Height */}
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>HEIGHT</Text>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>{profile.height_cm}</Text>
                <Text style={styles.metricUnit}>cm</Text>
              </View>
            </View>

            {/* Age */}
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>AGE</Text>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>{profile.age}</Text>
                <Text style={styles.metricUnit}>yrs</Text>
              </View>
            </View>

            {/* Gender */}
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>GENDER</Text>
              <Text style={styles.metricValue}>
                {profile.gender?.charAt(0).toUpperCase() + profile.gender?.slice(1)}
              </Text>
            </View>

            {/* Body Fat */}
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>BODY FAT</Text>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>{profile.body_fat || '--'}</Text>
                {profile.body_fat && <Text style={styles.metricUnit}>%</Text>}
              </View>
            </View>
          </View>
        </View>

        {/* STATS CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardIconBadge}>
              <Text>⚡</Text>
            </View>
            <Text style={styles.cardTitle}>Energy Stats</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>BMR</Text>
              <Text style={[styles.statValue, { color: DT.carb }]}>{profile.bmr}</Text>
              <Text style={styles.statUnit}>kcal/day</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>TDEE</Text>
              <Text style={[styles.statValue, { color: DT.lime }]}>{profile.tdee}</Text>
              <Text style={styles.statUnit}>kcal/day</Text>
            </View>
          </View>
        </View>

        {/* NUTRITION TARGETS CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardIconBadge}>
              <Text>🎯</Text>
            </View>
            <Text style={styles.cardTitle}>Nutrition Targets</Text>
          </View>

          {/* Training Day */}
          <View style={styles.targetCard}>
            <View style={styles.targetCardHeader}>
              <Text style={styles.targetCardLabel}>🏋️ Training Day</Text>
              <Text style={[styles.targetCardCal, { color: DT.lime }]}>
                {profile.training_day_calories} kcal
              </Text>
            </View>
            <View style={styles.targetMacros}>
              <View style={styles.targetMacroItem}>
                <Text style={[styles.targetMacroVal, { color: DT.protein }]}>
                  {profile.training_day_protein_g}g
                </Text>
                <Text style={styles.targetMacroLabel}>Protein</Text>
              </View>
              <View style={styles.targetMacroDivider} />
              <View style={styles.targetMacroItem}>
                <Text style={[styles.targetMacroVal, { color: DT.carb }]}>
                  {profile.training_day_carbs_g}g
                </Text>
                <Text style={styles.targetMacroLabel}>Carbs</Text>
              </View>
              <View style={styles.targetMacroDivider} />
              <View style={styles.targetMacroItem}>
                <Text style={[styles.targetMacroVal, { color: DT.fat }]}>
                  {profile.training_day_fat_g}g
                </Text>
                <Text style={styles.targetMacroLabel}>Fat</Text>
              </View>
            </View>
          </View>

          {/* Rest Day */}
          <View style={[styles.targetCard, { marginTop: 10 }]}>
            <View style={styles.targetCardHeader}>
              <Text style={styles.targetCardLabel}>😴 Rest Day</Text>
              <Text style={[styles.targetCardCal, { color: DT.fat }]}>
                {profile.rest_day_calories} kcal
              </Text>
            </View>
            <View style={styles.targetMacros}>
              <View style={styles.targetMacroItem}>
                <Text style={[styles.targetMacroVal, { color: DT.protein }]}>
                  {profile.rest_day_protein_g}g
                </Text>
                <Text style={styles.targetMacroLabel}>Protein</Text>
              </View>
              <View style={styles.targetMacroDivider} />
              <View style={styles.targetMacroItem}>
                <Text style={[styles.targetMacroVal, { color: DT.carb }]}>
                  {profile.rest_day_carbs_g}g
                </Text>
                <Text style={styles.targetMacroLabel}>Carbs</Text>
              </View>
              <View style={styles.targetMacroDivider} />
              <View style={styles.targetMacroItem}>
                <Text style={[styles.targetMacroVal, { color: DT.fat }]}>
                  {profile.rest_day_fat_g}g
                </Text>
                <Text style={styles.targetMacroLabel}>Fat</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SIGN OUT BUTTON */}
        <TouchableOpacity style={styles.signOutFullBtn} onPress={handleSignOut}>
          <Text style={styles.signOutFullBtnText}>Sign Out</Text>
        </TouchableOpacity>

      </View>

      {/* WEIGHT UPDATE MODAL */}
      <Modal visible={showWeightModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Weight</Text>
              <TouchableOpacity onPress={() => setShowWeightModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>NEW WEIGHT</Text>
            <View style={styles.modalInputRow}>
              <TextInput
                style={styles.modalInput}
                placeholder="70"
                placeholderTextColor={DT.textTert}
                value={newWeight}
                onChangeText={setNewWeight}
                keyboardType="numeric"
                autoFocus
              />
              <View style={styles.modalInputUnit}>
                <Text style={styles.modalInputUnitText}>kg</Text>
              </View>
            </View>

            <View style={styles.modalNote}>
              <Text style={styles.modalNoteIcon}>💡</Text>
              <Text style={styles.modalNoteText}>
                Updating weight will automatically recalculate your BMR, TDEE and macro targets
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.modalSaveBtn, updating && { opacity: 0.6 }]}
              onPress={handleUpdateWeight}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color={DT.bg} size="small" />
              ) : (
                <Text style={styles.modalSaveBtnText}>Update & Recalculate →</Text>
              )}
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DT.bg },
  loader: { flex: 1, backgroundColor: DT.bg, justifyContent: 'center', alignItems: 'center' },
  loaderText: { color: DT.textSec, marginTop: 12, fontSize: 14 },

  // HEADER
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: DT.border,
  },
  headerMono: { fontSize: 10, color: DT.lime, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: DT.text, letterSpacing: -0.5 },
  signOutBtn: {
    borderWidth: 1, borderColor: DT.border,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8,
  },
  signOutText: { fontSize: 13, color: DT.textSec, fontWeight: '500' },

  content: { paddingHorizontal: 16, paddingTop: 16 },

  // SPORT CARD
  sportCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: DT.card, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(203,255,71,0.2)',
    marginBottom: 12,
  },
  sportCardIcon: { fontSize: 52 },
  sportCardInfo: { flex: 1 },
  sportCardLabel: { fontSize: 9, color: DT.textSec, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
  sportCardName: { fontSize: 20, fontWeight: '800', color: DT.text, letterSpacing: -0.3, marginBottom: 8 },
  sportCardPhaseBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    backgroundColor: DT.limeDim, borderWidth: 1,
    borderColor: 'rgba(203,255,71,0.3)', alignSelf: 'flex-start',
  },
  sportCardPhaseText: { fontSize: 10, color: DT.lime, fontWeight: '700', letterSpacing: 1 },

  // CARD
  card: {
    backgroundColor: DT.card, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: DT.border, marginBottom: 12,
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  cardIconBadge: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: DT.limeDim, justifyContent: 'center', alignItems: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: DT.text },

  // METRICS GRID
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricItem: {
    width: '47%', backgroundColor: DT.cardAlt,
    borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: DT.border,
  },
  metricItemFull: {
    width: '100%', flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  metricItemLeft: {},
  metricLabel: { fontSize: 9, color: DT.textSec, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
  metricValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  metricValue: { fontSize: 22, fontWeight: '800', color: DT.text, letterSpacing: -0.5 },
  metricUnit: { fontSize: 13, color: DT.textSec, fontWeight: '500' },
  editBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    backgroundColor: DT.limeDim, borderWidth: 1,
    borderColor: 'rgba(203,255,71,0.3)',
  },
  editBtnText: { fontSize: 13, color: DT.lime, fontWeight: '700' },

  // STATS
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 9, color: DT.textSec, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
  statValue: { fontSize: 28, fontWeight: '800', letterSpacing: -1 },
  statUnit: { fontSize: 11, color: DT.textTert, marginTop: 2 },
  statDivider: { width: 1, height: 40, backgroundColor: DT.border },

  // TARGETS
  targetCard: {
    backgroundColor: DT.cardAlt, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: DT.border,
  },
  targetCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  targetCardLabel: { fontSize: 14, fontWeight: '700', color: DT.text },
  targetCardCal: { fontSize: 16, fontWeight: '800', letterSpacing: -0.5 },
  targetMacros: { flexDirection: 'row', justifyContent: 'space-around' },
  targetMacroItem: { alignItems: 'center' },
  targetMacroVal: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  targetMacroLabel: { fontSize: 10, color: DT.textSec, marginTop: 3 },
  targetMacroDivider: { width: 1, backgroundColor: DT.border },

  // SIGN OUT BUTTON
  signOutFullBtn: {
    borderWidth: 1, borderColor: DT.danger + '40',
    backgroundColor: 'rgba(224,90,90,0.06)',
    borderRadius: 12, padding: 16, alignItems: 'center',
    marginTop: 4, marginBottom: 16,
  },
  signOutFullBtnText: { fontSize: 15, color: DT.danger, fontWeight: '700' },

  // MODAL
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: DT.card, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24,
    borderWidth: 1, borderColor: DT.border,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: DT.text },
  modalClose: { fontSize: 20, color: DT.textSec },
  modalLabel: { fontSize: 9, color: DT.textSec, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  modalInputRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  modalInput: {
    flex: 1, backgroundColor: DT.cardAlt, borderRadius: 12,
    padding: 16, fontSize: 24, color: DT.text,
    borderWidth: 1, borderColor: DT.border, fontWeight: '700',
  },
  modalInputUnit: {
    width: 56, backgroundColor: DT.cardAlt, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: DT.border,
  },
  modalInputUnitText: { fontSize: 14, color: DT.textSec, fontWeight: '600' },
  modalNote: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: DT.bg, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: DT.border, marginBottom: 20,
  },
  modalNoteIcon: { fontSize: 14 },
  modalNoteText: { flex: 1, fontSize: 13, color: DT.textSec, lineHeight: 18 },
  modalSaveBtn: {
    backgroundColor: DT.lime, borderRadius: 12,
    height: 52, alignItems: 'center', justifyContent: 'center',
  },
  modalSaveBtnText: { fontSize: 15, fontWeight: '800', color: DT.bg },
});