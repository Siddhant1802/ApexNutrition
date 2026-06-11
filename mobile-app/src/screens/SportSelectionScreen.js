import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SPORTS, SPORT_CATEGORIES } from '../constants/sports';
import { DT } from '../constants/darkTheme';

export default function SportSelectionScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Object.values(SPORT_CATEGORIES)];

  const filteredSports =
    selectedCategory === 'All'
      ? SPORTS
      : SPORTS.filter((sport) => sport.category === selectedCategory);

  const handleSportSelect = (sport) => {
    navigation.navigate('BodyMetrics', { sport });
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.headerBadge}>
          <View style={styles.headerBadgeDot} />
          <Text style={styles.headerBadgeText}>Step 1 of 2</Text>
        </View>

        <Text style={styles.title}>Choose Your Sport</Text>
        <Text style={styles.subtitle}>
          Select your primary sport to get personalized macro targets
        </Text>

        {/* STATS ROW */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>24</Text>
            <Text style={styles.statLabel}>SPORTS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>6</Text>
            <Text style={styles.statLabel}>CATEGORIES</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>2x</Text>
            <Text style={styles.statLabel}>DAY TYPES</Text>
          </View>
        </View>
      </View>

      {/* CATEGORY FILTER */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryScrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive,
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* SPORTS GRID */}
      <ScrollView
        style={styles.sportsScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sportsGrid}>
          {filteredSports.map((sport) => (
            <TouchableOpacity
              key={sport.id}
              style={styles.sportCard}
              onPress={() => handleSportSelect(sport)}
              activeOpacity={0.7}
            >
              {/* CARD GLOW on active */}
              <Text style={styles.sportIcon}>{sport.icon}</Text>
              <Text style={styles.sportName}>{sport.name}</Text>
              {sport.category && (
                <View style={styles.sportCategoryBadge}>
                  <Text style={styles.sportCategoryText}>
                    {sport.category}
                  </Text>
                </View>
              )}
              <Text style={styles.sportArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DT.bg,
  },

  // HEADER
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: DT.border,
  },
  backBtn: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    fontSize: 14,
    color: DT.lime,
    fontWeight: '600',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(203,255,71,0.3)',
    backgroundColor: 'rgba(203,255,71,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  headerBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DT.lime,
  },
  headerBadgeText: {
    fontSize: 11,
    color: DT.lime,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: DT.text,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: DT.textSec,
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 20,
  },

  // STATS
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DT.card,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: DT.border,
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center' },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
    color: DT.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 9,
    color: DT.textSec,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 3,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: DT.border,
  },

  // CATEGORY FILTER
  categoryScroll: {
    maxHeight: 52,
    marginVertical: 14,
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: DT.card,
    borderWidth: 1,
    borderColor: DT.border,
  },
  categoryChipActive: {
    backgroundColor: DT.limeDim,
    borderColor: DT.lime,
  },
  categoryText: {
    fontSize: 13,
    color: DT.textSec,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: DT.lime,
    fontWeight: '700',
  },

  // SPORTS GRID
  sportsScroll: { flex: 1 },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    paddingTop: 4,
  },
  sportCard: {
    width: '47%',
    backgroundColor: DT.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DT.border,
    position: 'relative',
  },
  sportIcon: {
    fontSize: 44,
    marginBottom: 10,
  },
  sportName: {
    fontSize: 14,
    fontWeight: '700',
    color: DT.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  sportCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: DT.border,
  },
  sportCategoryText: {
    fontSize: 10,
    color: DT.textSec,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sportArrow: {
    position: 'absolute',
    top: 12,
    right: 12,
    fontSize: 12,
    color: DT.textTert,
  },
});