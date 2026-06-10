import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mealsAPI, waterAPI } from '../services/api';
import FoodSearchModal from '../components/FoodSearchModal';
import Svg, { Circle } from 'react-native-svg';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  Animated,
  Easing,
} from 'react-native';
import { DT } from '../constants/darkTheme';

const { width } = Dimensions.get('window');

// ── MACRO RING ──────────────────────────────────────────────
function MacroRing({ value, max, color, label, size = 100 }) {
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min((value / max) * 100, 100);
  const offset = circumference - (pct / 100) * circumference;
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={size/2} cy={size/2} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={9} fill="none" />
          <Circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth={9} fill="none"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
        </Svg>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: DT.text, letterSpacing: -0.5 }}>{value}</Text>
          <Text style={{ fontSize: 10, color: DT.textSec, marginTop: 2 }}>/ {max}g</Text>
        </View>
      </View>
      <Text style={{ fontSize: 12, color: DT.textSec, marginTop: 8, fontWeight: '500' }}>{label}</Text>
    </View>
  );
}

// ── GLOW BAR ────────────────────────────────────────────────
function GlowBar({ value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <View style={styles.glowBarTrack}>
      <View style={[styles.glowBarFill, {
        width: `${pct}%`, backgroundColor: color,
        shadowColor: color, shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9, shadowRadius: 8, elevation: 6,
      }]} />
    </View>
  );
}

// ── CARD ────────────────────────────────────────────────────
function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ── CARD HEADER ─────────────────────────────────────────────
function CardHeader({ icon, title, hint }) {
  return (
    <View style={styles.cardHeader}>
      <View style={styles.cardHeaderLeft}>
        <View style={styles.cardIconBadge}>
          <Text style={{ fontSize: 15 }}>{icon}</Text>
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {hint && <Text style={styles.cardHint}>{hint}</Text>}
    </View>
  );
}

// ── WATER CONFETTI ──────────────────────────────────────────
const WATER_COLORS = ['#5fc9d6','#5b9bf0','#3dd1e7','#7dd3fc','#38bdf8','#0ea5e9','#22d3ee','#67e8f9'];

function WaterConfetti({ active }) {
  const [particles, setParticles] = useState([]);
  const animationsRef = React.useRef([]);

  useEffect(() => {
    if (active) {
      spawnParticles();
    } else {
      setParticles([]);
      animationsRef.current.forEach(a => a.stop());
      animationsRef.current = [];
    }
  }, [active]);

  const spawnParticles = () => {
    const count = 40;
    const newParticles = [];
    const newAnims = [];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const translateX = new Animated.Value(0);
      const translateY = new Animated.Value(0);
      const opacity = new Animated.Value(1);
      const scale = new Animated.Value(1);
      const targetX = Math.cos(angle) * (50 + Math.random() * 100);
      const targetY = Math.sin(angle) * (50 + Math.random() * 100) - Math.random() * 80;
      const duration = 800 + Math.random() * 600;

      const anim = Animated.parallel([
        Animated.timing(translateX, { toValue: targetX, duration, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: targetY + 60, duration, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.2, duration, useNativeDriver: true }),
      ]);

      newAnims.push(anim);
      newParticles.push({
        id: i, translateX, translateY, opacity, scale,
        color: WATER_COLORS[Math.floor(Math.random() * WATER_COLORS.length)],
        size: 4 + Math.random() * 8,
        shape: Math.random() < 0.5 ? 'circle' : Math.random() < 0.8 ? 'oval' : 'ring',
      });
    }

    setParticles(newParticles);
    animationsRef.current = newAnims;
    Animated.stagger(20, newAnims).start(() => setParticles([]));
  };

  if (particles.length === 0) return null;

  return (
    <View style={styles.confettiContainer} pointerEvents="none">
      {particles.map(p => (
        <Animated.View key={p.id} style={{
          position: 'absolute', top: '50%', left: '50%',
          opacity: p.opacity,
          transform: [{ translateX: p.translateX }, { translateY: p.translateY }, { scale: p.scale }],
        }}>
          {p.shape === 'ring' ? (
            <View style={{ width: p.size*2, height: p.size*2, borderRadius: p.size, borderWidth: 2, borderColor: p.color }} />
          ) : p.shape === 'oval' ? (
            <View style={{ width: p.size*1.2, height: p.size*2, borderRadius: p.size, backgroundColor: p.color }} />
          ) : (
            <View style={{ width: p.size, height: p.size, borderRadius: p.size/2, backgroundColor: p.color }} />
          )}
        </Animated.View>
      ))}
    </View>
  );
}

// ── STREAK HELPER ───────────────────────────────────────────
const STREAK_KEY = 'apex_streak_data';

async function getStreak() {
  try {
    const raw = await AsyncStorage.getItem(STREAK_KEY);
    if (!raw) return { count: 0, lastDate: null };
    return JSON.parse(raw);
  } catch { return { count: 0, lastDate: null }; }
}

async function updateStreak(hasMealsToday) {
  const today = new Date().toISOString().split('T')[0];
  const data = await getStreak();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (data.lastDate === today) {
    // already updated today - just return current
    return data.count;
  }

  let newCount;
  if (!data.lastDate) {
    // First time ever
    newCount = hasMealsToday ? 1 : 0;
  } else if (data.lastDate === yesterday) {
    // Consecutive day
    newCount = hasMealsToday ? data.count + 1 : 0;
  } else {
    // Streak broken (missed a day)
    newCount = hasMealsToday ? 1 : 0;
  }

  const newData = { count: newCount, lastDate: hasMealsToday ? today : data.lastDate };
  await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(newData));
  return newCount;
}

// ── HOME SCREEN ─────────────────────────────────────────────
export default function HomeScreen({ route, navigation }) {
  const { athleteData, macros, sport } = route.params;
  const [isTrainingDay, setIsTrainingDay] = useState(true);
  const [consumed, setConsumed] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [meals, setMeals] = useState({ breakfast: [], lunch: [], dinner: [], snacks: [] });
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [currentMealType, setCurrentMealType] = useState('');
  const [loading, setLoading] = useState(true);
  const [waterData, setWaterData] = useState({ total_ml: 0, goal_ml: 2500, percentage: 0, logs: [] });
  const [waterGoalReached, setWaterGoalReached] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [streakCount, setStreakCount] = useState(0);

  const targets = isTrainingDay ? macros.trainingDay : macros.restDay;

  useEffect(() => {
    loadTodaysMeals();
    loadWaterData();
  }, []);

  // ── WATER GOAL EFFECT ──
  useEffect(() => {
    if (waterData.percentage >= 100 && !waterGoalReached) {
      setWaterGoalReached(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    } else if (waterData.percentage < 100 && waterGoalReached) {
      setWaterGoalReached(false);
      setShowConfetti(false);
    }
  }, [waterData.percentage]);

  const loadTodaysMeals = async () => {
    try {
      const response = await mealsAPI.getToday();
      const loadedMeals = response.data;
      const grouped = { breakfast: [], lunch: [], dinner: [], snacks: [] };
      let total = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      loadedMeals.forEach(meal => {
        const m = {
          id: meal.id, name: meal.food_name, weight: meal.weight_grams,
          calories: meal.calories, protein: meal.protein_g,
          carbs: meal.carbs_g, fat: meal.fat_g, mealType: meal.meal_type,
        };
        grouped[meal.meal_type].push(m);
        total.calories += meal.calories;
        total.protein += meal.protein_g;
        total.carbs += meal.carbs_g;
        total.fat += meal.fat_g;
      });
      setMeals(grouped);
      setConsumed(total);

      // Update streak based on whether meals were logged today
      const hasMeals = loadedMeals.length > 0;
      const streak = await updateStreak(hasMeals);
      setStreakCount(streak);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadWaterData = async () => {
    try {
      const r = await waterAPI.getToday();
      setWaterData(r.data);
    } catch (e) {}
  };

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('token');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const handleAddFood = async (foodData) => {
    try {
      const r = await mealsAPI.create({
        meal_type: foodData.mealType, food_name: foodData.name,
        weight_grams: foodData.weight, calories: foodData.calories,
        protein_g: foodData.protein, carbs_g: foodData.carbs, fat_g: foodData.fat,
      });
      const saved = { ...foodData, id: r.data.id };
      setMeals(prev => ({ ...prev, [foodData.mealType]: [...prev[foodData.mealType], saved] }));
      setConsumed(prev => ({
        calories: prev.calories + foodData.calories,
        protein: prev.protein + foodData.protein,
        carbs: prev.carbs + foodData.carbs,
        fat: prev.fat + foodData.fat,
      }));
      // Update streak since a meal was just logged
      const streak = await updateStreak(true);
      setStreakCount(streak);
    } catch (e) { alert('Failed to save meal.'); }
  };

  const deleteMeal = async (mealType, index) => {
    const food = meals[mealType][index];
    try {
      await mealsAPI.delete(food.id);
      setMeals(prev => ({ ...prev, [mealType]: prev[mealType].filter((_, i) => i !== index) }));
      setConsumed(prev => ({
        calories: prev.calories - food.calories,
        protein: prev.protein - food.protein,
        carbs: prev.carbs - food.carbs,
        fat: prev.fat - food.fat,
      }));
    } catch (e) { alert('Failed to delete.'); }
  };

  const getMealCal = (t) => meals[t].reduce((s, f) => s + f.calories, 0);
  const remaining = targets.calories - consumed.calories;

  const renderMealSection = (type, label) => {
    const items = meals[type];
    const cal = getMealCal(type);
    return (
      <View key={type}>
        <View style={styles.mealRow}>
          <Text style={styles.mealTypeLabel}>{label.toUpperCase()}</Text>
          <Text style={styles.mealRowCal}>{cal} kcal</Text>
          <TouchableOpacity
            style={styles.mealAddBtn}
            onPress={() => { setCurrentMealType(type); setShowFoodModal(true); }}
          >
            <Text style={styles.mealAddBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {items.map((food, i) => (
          <View key={food.id || i} style={styles.foodRow}>
            <View style={styles.foodRowLeft}>
              <Text style={styles.foodRowName} numberOfLines={1}>{food.name}</Text>
              <Text style={styles.foodRowSub}>
                {food.calories} kcal · C {food.carbs}g · P {food.protein}g · F {food.fat}g
              </Text>
            </View>
            <TouchableOpacity onPress={() => deleteMeal(type, i)} style={styles.foodDelBtn}>
              <Text style={styles.foodDelBtnText}>🗑</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.mealDivider} />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={DT.lime} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ── HERO HEADER ── */}
      <ImageBackground
        source={require('../../assets/hero-athlete.jpg')}
        style={styles.heroHeader}
        imageStyle={styles.heroHeaderImage}
      >
        <View style={styles.heroOverlay}>
          <View style={styles.heroContent}>
            <View>
              <View style={styles.heroBadge}>
                <View style={styles.heroBadgeDot} />
                <Text style={styles.heroBadgeText}>Thesis project · AI × Sport Science</Text>
              </View>
              <Text style={styles.heroMono}>
                TODAY · {isTrainingDay ? 'TRAINING DAY' : 'REST DAY'}
              </Text>
              <Text style={styles.heroName}>{sport.icon} {sport.name}</Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatNum}>{targets.calories}</Text>
                  <Text style={styles.heroStatLabel}>TARGET KCAL</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatNum}>{athleteData.trainingPhase || 'Base'}</Text>
                  <Text style={styles.heroStatLabel}>PHASE</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Text style={[styles.heroStatNum, { color: DT.lime }]}>
                    {streakCount > 0 ? `Day ${streakCount}` : 'Day 1'}
                  </Text>
                  <Text style={styles.heroStatLabel}>🔥 STREAK</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
              <Text style={styles.signOutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      {/* ── TRAINING/REST TOGGLE ── */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, isTrainingDay && styles.toggleBtnActive]}
          onPress={() => setIsTrainingDay(true)}
        >
          <Text style={[styles.toggleBtnText, isTrainingDay && styles.toggleBtnTextActive]}>
            🏋️ Training Day
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, !isTrainingDay && styles.toggleBtnActive]}
          onPress={() => setIsTrainingDay(false)}
        >
          <Text style={[styles.toggleBtnText, !isTrainingDay && styles.toggleBtnTextActive]}>
            😴 Rest Day
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>

        {/* ── TOP ROW: CALORIES | MACROS | HYDRATION ── */}
        <View style={styles.topRow}>

          {/* CALORIES */}
          <Card style={styles.topCard}>
            <CardHeader
              icon="🔥"
              title="Calories"
              hint={isTrainingDay ? 'TRAINING DAY' : 'REST DAY'}
            />
            <View style={styles.bigNumRow}>
              <Text style={styles.bigNum}>{consumed.calories}</Text>
              <Text style={styles.bigNumDenom}> / {targets.calories} kcal</Text>
            </View>
            <GlowBar value={consumed.calories} max={targets.calories} color={DT.lime} />
            <View style={styles.pillRow}>
              <Text style={styles.pillText}>
                Food: <Text style={styles.pillVal}>{consumed.calories}</Text>
              </Text>
              <Text style={styles.pillText}>
                Remaining: <Text style={[styles.pillVal, { color: remaining >= 0 ? DT.lime : DT.danger }]}>
                  {remaining}
                </Text>
              </Text>
            </View>
          </Card>

          {/* MACROS */}
          <Card style={styles.topCard}>
            <CardHeader icon="📈" title="Macros" hint="GRAMS" />
            <View style={styles.macroRingsRow}>
              <MacroRing value={consumed.carbs} max={targets.carbs} color={DT.carb} label="Carbs" size={100} />
              <MacroRing value={consumed.protein} max={targets.protein} color={DT.protein} label="Protein" size={100} />
              <MacroRing value={consumed.fat} max={targets.fat} color={DT.fat} label="Fat" size={100} />
            </View>
          </Card>

          {/* HYDRATION */}
          <Card style={styles.topCard}>
            <CardHeader icon="💧" title="Hydration" hint={`GOAL ${waterData.goal_ml}ML`} />
            <View style={styles.bigNumRow}>
              <Text style={styles.bigNum}>{waterData.total_ml}</Text>
              <Text style={styles.bigNumDenom}> / {waterData.goal_ml} ml</Text>
            </View>
            <GlowBar value={waterData.total_ml} max={waterData.goal_ml} color={DT.water} />

            {/* CONFETTI + GOAL BADGE */}
            <View style={{ position: 'relative' }}>
              <WaterConfetti active={showConfetti} />
              {waterGoalReached && (
                <View style={styles.waterGoalBadge}>
                  <Text style={styles.waterGoalText}>🎉 Daily hydration goal achieved!</Text>
                </View>
              )}
            </View>

            <View style={styles.waterBtns}>
              {[150, 250, 350, 500].map(amt => (
                <TouchableOpacity
                  key={amt}
                  style={styles.waterBtn}
                  onPress={() => waterAPI.log(amt).then(loadWaterData)}
                >
                  <Text style={styles.waterBtnText}>+{amt}ml</Text>
                </TouchableOpacity>
              ))}
            </View>

            {waterData.logs?.length > 0 && (
              <TouchableOpacity
                style={styles.undoBtn}
                onPress={async () => {
                  await waterAPI.delete(waterData.logs[waterData.logs.length - 1].id);
                  loadWaterData();
                }}
              >
                <Text style={styles.undoBtnText}>
                  ↩ Undo (+{waterData.logs[waterData.logs.length - 1]?.amount_ml}ml)
                </Text>
              </TouchableOpacity>
            )}
          </Card>
        </View>

        {/* ── BOTTOM ROW: DIARY | STATS ── */}
        <View style={styles.bottomRow}>

          {/* FOOD DIARY */}
          <Card style={styles.diaryCard}>
            <CardHeader icon="🍽️" title="Food diary" hint="TODAY" />
            <View style={{ marginTop: 8 }}>
              {renderMealSection('breakfast', 'Breakfast')}
              {renderMealSection('lunch', 'Lunch')}
              {renderMealSection('dinner', 'Dinner')}
              {renderMealSection('snacks', 'Snack')}
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Totals</Text>
              <Text style={styles.totalsMono}>
                {consumed.calories} kcal · C {consumed.carbs}g · P {consumed.protein}g · F {consumed.fat}g
              </Text>
            </View>
          </Card>

          {/* RIGHT COL */}
          <View style={styles.rightCol}>

            {/* YOUR STATS */}
            <Card>
              <CardHeader
                icon="🏆"
                title="Your stats"
                hint={`${(athleteData.trainingPhase || 'BASE').toUpperCase()} PHASE`}
              />
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>BMR</Text>
                  <Text style={styles.statValue}>{macros.bmr} kcal</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>TDEE</Text>
                  <Text style={styles.statValue}>{macros.tdee} kcal</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>WEIGHT</Text>
                  <Text style={styles.statValue}>{athleteData.weight} kg</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>HEIGHT</Text>
                  <Text style={styles.statValue}>{athleteData.height} cm</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>AGE</Text>
                  <Text style={styles.statValue}>{athleteData.age}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>STREAK</Text>
                  <Text style={[styles.statValue, { color: DT.lime }]}>
                    🔥 {streakCount > 0 ? `${streakCount} days` : 'Day 1'}
                  </Text>
                </View>
              </View>
            </Card>

            {/* PERIODIZED TARGETS */}
            <Card style={{ marginTop: 12 }}>
              <CardHeader icon="📊" title="Periodized targets" />
              <View style={{ marginTop: 12, gap: 8 }}>
                <View style={[styles.phaseCard, isTrainingDay && styles.phaseCardActive]}>
                  <View style={styles.phaseCardTop}>
                    <Text style={styles.phaseCardLabel}>Training day</Text>
                    <Text style={styles.phaseCardCal}>{macros.trainingDay.calories} kcal</Text>
                  </View>
                  <Text style={styles.phaseCardMacros}>
                    C {macros.trainingDay.carbs}g · P {macros.trainingDay.protein}g · F {macros.trainingDay.fat}g
                  </Text>
                </View>
                <View style={[styles.phaseCard, !isTrainingDay && styles.phaseCardActive]}>
                  <View style={styles.phaseCardTop}>
                    <Text style={styles.phaseCardLabel}>Rest day</Text>
                    <Text style={styles.phaseCardCal}>{macros.restDay.calories} kcal</Text>
                  </View>
                  <Text style={styles.phaseCardMacros}>
                    C {macros.restDay.carbs}g · P {macros.restDay.protein}g · F {macros.restDay.fat}g
                  </Text>
                </View>
              </View>
            </Card>

          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />

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
  container: { flex: 1, backgroundColor: DT.bg },
  loader: { flex: 1, backgroundColor: DT.bg, justifyContent: 'center', alignItems: 'center' },

  // HERO
  heroHeader: { width: '100%', height: 240 },
  heroHeaderImage: { opacity: 0.55 },
  heroOverlay: {
    flex: 1, backgroundColor: 'rgba(13,15,18,0.72)',
    paddingHorizontal: 24, paddingTop: 56, paddingBottom: 24, justifyContent: 'flex-end',
  },
  heroContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(203,255,71,0.3)',
    backgroundColor: 'rgba(203,255,71,0.08)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    alignSelf: 'flex-start', marginBottom: 12,
  },
  heroBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: DT.lime },
  heroBadgeText: { fontSize: 11, color: DT.lime, fontWeight: '500' },
  heroMono: { fontSize: 11, color: DT.lime, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  heroName: { fontSize: 28, fontWeight: '800', color: DT.text, letterSpacing: -0.5, marginBottom: 16 },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroStatItem: { alignItems: 'flex-start' },
  heroStatNum: { fontSize: 18, fontWeight: '800', color: DT.text, letterSpacing: -0.5 },
  heroStatLabel: { fontSize: 9, color: DT.textSec, fontWeight: '600', letterSpacing: 1.5, marginTop: 2 },
  heroStatDivider: { width: 1, height: 28, backgroundColor: DT.border },
  signOutBtn: { borderWidth: 1, borderColor: DT.border, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  signOutText: { fontSize: 13, color: DT.textSec, fontWeight: '500' },

  // TOGGLE
  toggleRow: {
    flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: DT.bg, borderBottomWidth: 1, borderBottomColor: DT.border,
    marginBottom: 20, gap: 10,
  },
  toggleBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    borderWidth: 1, borderColor: DT.border, backgroundColor: DT.card,
  },
  toggleBtnActive: { backgroundColor: DT.limeDim, borderColor: DT.lime },
  toggleBtnText: { fontSize: 14, color: DT.textSec, fontWeight: '600' },
  toggleBtnTextActive: { color: DT.lime, fontWeight: '700' },

  // CONTENT
  content: { paddingHorizontal: 20, maxWidth: 1400, alignSelf: 'center', width: '100%' },

  // TOP ROW
  topRow: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  topCard: { flex: 1 },

  // CARD
  card: { backgroundColor: DT.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: DT.border },

  // CARD HEADER
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIconBadge: { width: 34, height: 34, borderRadius: 9, backgroundColor: DT.limeDim, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: DT.text },
  cardHint: { fontSize: 10, color: DT.textSec, fontWeight: '600', letterSpacing: 1.2 },

  // BIG NUMBER
  bigNumRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 14 },
  bigNum: { fontSize: 72, fontWeight: '800', color: DT.text, letterSpacing: -3, lineHeight: 76 },
  bigNumDenom: { fontSize: 15, color: DT.textSec, fontWeight: '400', marginLeft: 4 },

  // PILL ROW
  pillRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  pillText: { fontSize: 12, color: DT.textSec },
  pillVal: { fontSize: 12, fontWeight: '700', color: DT.text },

  // GLOW BAR
  glowBarTrack: { height: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 5, overflow: 'hidden' },
  glowBarFill: { height: '100%', borderRadius: 5 },

  // MACRO RINGS
  macroRingsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 8 },

  // WATER
  waterGoalBadge: {
    marginTop: 10, marginBottom: 4,
    paddingVertical: 10, paddingHorizontal: 14,
    backgroundColor: 'rgba(203,255,71,0.1)',
    borderWidth: 1, borderColor: 'rgba(203,255,71,0.3)',
    borderRadius: 10, alignItems: 'center',
  },
  waterGoalText: { fontSize: 13, fontWeight: '700', color: DT.lime },
  waterBtns: { flexDirection: 'row', gap: 6, marginTop: 12, flexWrap: 'wrap' },
  waterBtn: { flex: 1, borderWidth: 1, borderColor: DT.border, borderRadius: 8, paddingVertical: 8, alignItems: 'center', minWidth: 55 },
  waterBtnText: { fontSize: 11, color: DT.water, fontWeight: '600' },
  undoBtn: { marginTop: 8, paddingVertical: 6, alignItems: 'center', borderTopWidth: 1, borderTopColor: DT.border },
  undoBtnText: { fontSize: 11, color: DT.textSec },

  // CONFETTI
  confettiContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, overflow: 'hidden' },

  // BOTTOM ROW
  bottomRow: { flexDirection: 'row', gap: 20, alignItems: 'flex-start' },
  diaryCard: { flex: 1.4 },
  rightCol: { flex: 1 },

  // MEAL SECTIONS
  mealRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 8 },
  mealTypeLabel: { fontSize: 10, color: DT.lime, fontWeight: '700', letterSpacing: 1.5, width: 72 },
  mealRowCal: { flex: 1, fontSize: 12, color: DT.textSec },
  mealAddBtn: { borderWidth: 1, borderColor: DT.border, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  mealAddBtnText: { fontSize: 11, color: DT.lime, fontWeight: '600' },
  foodRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingLeft: 80, gap: 8, borderTopWidth: 1, borderTopColor: DT.border },
  foodRowLeft: { flex: 1 },
  foodRowName: { fontSize: 13, fontWeight: '500', color: DT.text },
  foodRowSub: { fontSize: 11, color: DT.textSec, marginTop: 3 },
  foodDelBtn: { padding: 4, opacity: 0.6 },
  foodDelBtnText: { fontSize: 14 },
  mealDivider: { height: 1, backgroundColor: DT.border },

  // TOTALS
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)', marginTop: 8 },
  totalsLabel: { fontSize: 13, fontWeight: '700', color: DT.text },
  totalsMono: { fontSize: 11, color: DT.textSec },

  // STATS
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 16 },
  statItem: { width: '45%' },
  statLabel: { fontSize: 9, color: DT.textSec, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '700', color: DT.text, letterSpacing: -0.5 },

  // PHASE CARDS
  phaseCard: { borderWidth: 1, borderColor: DT.border, borderRadius: 12, padding: 14, backgroundColor: 'rgba(255,255,255,0.02)' },
  phaseCardActive: { borderColor: 'rgba(203,255,71,0.35)', backgroundColor: 'rgba(203,255,71,0.05)' },
  phaseCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  phaseCardLabel: { fontSize: 13, fontWeight: '600', color: DT.text },
  phaseCardCal: { fontSize: 13, fontWeight: '700', color: DT.text },
  phaseCardMacros: { fontSize: 11, color: DT.textSec },
});