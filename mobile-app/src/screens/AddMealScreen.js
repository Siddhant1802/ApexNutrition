import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { DT } from '../constants/darkTheme';
import FoodSearchModal from '../components/FoodSearchModal';
import { mealsAPI } from '../services/api';
import { showToast } from '../components/Toast';

export default function AddMealScreen({ navigation }) {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');

  // Quick add state
  const [quickForm, setQuickForm] = useState({
    name: '', calories: '', protein: '', carbs: '', fat: '',
  });

  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { id: 'lunch', label: 'Lunch', icon: '☀️' },
    { id: 'dinner', label: 'Dinner', icon: '🌙' },
    { id: 'snacks', label: 'Snacks', icon: '🍎' },
  ];

  const handleAddFood = async (foodData) => {
    try {
      await mealsAPI.create({
        meal_type: foodData.mealType,
        food_name: foodData.name,
        weight_grams: foodData.weight,
        calories: foodData.calories,
        protein_g: foodData.protein,
        carbs_g: foodData.carbs,
        fat_g: foodData.fat,
      });
      showToast('Meal logged successfully!', 'success');
      setShowSearchModal(false);
    } catch (e) {
      showToast('Failed to save meal', 'error');
    }
  };

  const handleQuickAdd = async () => {
    if (!quickForm.name || !quickForm.calories) {
      showToast('Name and calories are required', 'error');
      return;
    }
    try {
      await mealsAPI.create({
        meal_type: selectedMealType,
        food_name: quickForm.name,
        weight_grams: 100,
        calories: parseFloat(quickForm.calories) || 0,
        protein_g: parseFloat(quickForm.protein) || 0,
        carbs_g: parseFloat(quickForm.carbs) || 0,
        fat_g: parseFloat(quickForm.fat) || 0,
      });
      showToast('Meal logged!', 'success');
      setShowQuickModal(false);
      setQuickForm({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    } catch (e) {
      showToast('Failed to save meal', 'error');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerMono}>FOOD LOGGING</Text>
          <Text style={styles.headerTitle}>Add Meal</Text>
          <Text style={styles.headerSubtitle}>
            Log your nutrition intake
          </Text>
        </View>

        {/* MEAL TYPE SELECTOR */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Select Meal Type</Text>
          <View style={styles.mealTypeGrid}>
            {mealTypes.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.mealTypeBtn,
                  selectedMealType === type.id && styles.mealTypeBtnActive
                ]}
                onPress={() => setSelectedMealType(type.id)}
              >
                <Text style={styles.mealTypeIcon}>{type.icon}</Text>
                <Text style={[
                  styles.mealTypeLabel,
                  selectedMealType === type.id && styles.mealTypeLabelActive
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* LOG OPTIONS */}
        <Text style={styles.sectionTitle}>How do you want to log?</Text>

        {/* SEARCH FOOD */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => setShowSearchModal(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.optionIconBadge, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
            <Text style={styles.optionIcon}>🔍</Text>
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>Search Food Database</Text>
            <Text style={styles.optionSubtitle}>
              300,000+ foods from USDA database
            </Text>
          </View>
          <Text style={styles.optionArrow}>→</Text>
        </TouchableOpacity>

        {/* QUICK ADD */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => setShowQuickModal(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.optionIconBadge, { backgroundColor: 'rgba(203,255,71,0.12)' }]}>
            <Text style={styles.optionIcon}>✏️</Text>
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>Quick Add Macros</Text>
            <Text style={styles.optionSubtitle}>
              Enter calories and macros directly
            </Text>
          </View>
          <Text style={styles.optionArrow}>→</Text>
        </TouchableOpacity>

        {/* PHOTO AI - COMING SOON */}
        <View style={[styles.optionCard, styles.optionCardDisabled]}>
          <View style={[styles.optionIconBadge, { backgroundColor: 'rgba(232,168,56,0.12)' }]}>
            <Text style={styles.optionIcon}>📸</Text>
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>AI Photo Scanner</Text>
            <Text style={styles.optionSubtitle}>
              Take a photo to identify food
            </Text>
          </View>
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Soon</Text>
          </View>
        </View>

        {/* BARCODE - COMING SOON */}
        <View style={[styles.optionCard, styles.optionCardDisabled]}>
          <View style={[styles.optionIconBadge, { backgroundColor: 'rgba(61,184,200,0.12)' }]}>
            <Text style={styles.optionIcon}>📱</Text>
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>Barcode Scanner</Text>
            <Text style={styles.optionSubtitle}>
              Scan product barcode
            </Text>
          </View>
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Soon</Text>
          </View>
        </View>

        {/* TIP CARD */}
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Pro Tip</Text>
            <Text style={styles.tipText}>
              You can also log meals directly from the Home screen by tapping "+ Add" next to each meal section
            </Text>
          </View>
        </View>

      </View>

      {/* FOOD SEARCH MODAL */}
      <FoodSearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        mealType={selectedMealType}
        onAddFood={handleAddFood}
      />

      {/* QUICK ADD MODAL */}
      <Modal visible={showQuickModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Quick Add</Text>
              <TouchableOpacity onPress={() => setShowQuickModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalMealType}>
              Adding to: {mealTypes.find(m => m.id === selectedMealType)?.icon}{' '}
              {mealTypes.find(m => m.id === selectedMealType)?.label}
            </Text>

            {/* Food Name */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>FOOD NAME *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Oatmeal with banana"
                placeholderTextColor={DT.textTert}
                value={quickForm.name}
                onChangeText={v => setQuickForm(p => ({ ...p, name: v }))}
              />
            </View>

            {/* Calories */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>CALORIES *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="350"
                placeholderTextColor={DT.textTert}
                value={quickForm.calories}
                onChangeText={v => setQuickForm(p => ({ ...p, calories: v }))}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Macros Row */}
            <View style={styles.modalMacroRow}>
              {[
                { key: 'protein', label: 'PROTEIN', color: DT.protein, placeholder: '25' },
                { key: 'carbs', label: 'CARBS', color: DT.carb, placeholder: '45' },
                { key: 'fat', label: 'FAT', color: DT.fat, placeholder: '10' },
              ].map(m => (
                <View key={m.key} style={styles.modalMacroItem}>
                  <Text style={[styles.modalInputLabel, { color: m.color }]}>{m.label}</Text>
                  <TextInput
                    style={[styles.modalInput, { borderColor: m.color + '40' }]}
                    placeholder={m.placeholder}
                    placeholderTextColor={DT.textTert}
                    value={quickForm[m.key]}
                    onChangeText={v => setQuickForm(p => ({ ...p, [m.key]: v }))}
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.modalMacroUnit}>g</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.modalSaveBtn} onPress={handleQuickAdd}>
              <Text style={styles.modalSaveBtnText}>Log Meal →</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DT.bg },
  content: { paddingHorizontal: 20, paddingBottom: 40 },

  // HEADER
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: DT.border,
    marginBottom: 16,
  },
  headerMono: { fontSize: 10, color: DT.lime, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: DT.text, letterSpacing: -0.5, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: DT.textSec },

  // CARD
  card: {
    backgroundColor: DT.card, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: DT.border, marginBottom: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: DT.text, marginBottom: 14 },

  // MEAL TYPE
  mealTypeGrid: { flexDirection: 'row', gap: 8 },
  mealTypeBtn: {
    flex: 1, backgroundColor: DT.cardAlt, borderRadius: 12,
    padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: DT.border,
  },
  mealTypeBtnActive: {
    backgroundColor: DT.limeDim,
    borderColor: DT.lime,
  },
  mealTypeIcon: { fontSize: 20, marginBottom: 4 },
  mealTypeLabel: { fontSize: 11, fontWeight: '600', color: DT.textSec },
  mealTypeLabelActive: { color: DT.lime },

  // SECTION TITLE
  sectionTitle: {
    fontSize: 13, color: DT.textSec, fontWeight: '600',
    letterSpacing: 0.5, marginBottom: 10,
  },

  // OPTION CARDS
  optionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: DT.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: DT.border, marginBottom: 10,
  },
  optionCardDisabled: { opacity: 0.5 },
  optionIconBadge: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  optionIcon: { fontSize: 24 },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '700', color: DT.text, marginBottom: 3 },
  optionSubtitle: { fontSize: 12, color: DT.textSec },
  optionArrow: { fontSize: 16, color: DT.lime, fontWeight: '700' },
  comingSoonBadge: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: DT.border,
  },
  comingSoonText: { fontSize: 10, color: DT.textTert, fontWeight: '600' },

  // TIP CARD
  tipCard: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: DT.card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: DT.border, marginTop: 6,
  },
  tipIcon: { fontSize: 18 },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 13, fontWeight: '700', color: DT.text, marginBottom: 4 },
  tipText: { fontSize: 12, color: DT.textSec, lineHeight: 18 },

  // MODAL
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: DT.card, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24,
    borderWidth: 1, borderColor: DT.border,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: DT.text },
  modalClose: { fontSize: 20, color: DT.textSec },
  modalMealType: { fontSize: 13, color: DT.textSec, marginBottom: 20 },
  modalInputGroup: { marginBottom: 14 },
  modalInputLabel: {
    fontSize: 9, color: DT.textSec, fontWeight: '700',
    letterSpacing: 1.5, marginBottom: 6,
  },
  modalInput: {
    backgroundColor: DT.cardAlt, borderRadius: 10,
    padding: 12, fontSize: 15, color: DT.text,
    borderWidth: 1, borderColor: DT.border,
  },
  modalMacroRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  modalMacroItem: { flex: 1 },
  modalMacroUnit: {
    fontSize: 11, color: DT.textTert, fontWeight: '600',
    textAlign: 'right', marginTop: 4,
  },
  modalSaveBtn: {
    backgroundColor: DT.lime, borderRadius: 12,
    height: 52, alignItems: 'center', justifyContent: 'center',
  },
  modalSaveBtnText: { fontSize: 15, fontWeight: '800', color: DT.bg },
});