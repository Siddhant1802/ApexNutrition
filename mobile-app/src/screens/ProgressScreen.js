import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { mealsAPI, waterAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DT } from '../constants/darkTheme';

const { width } = Dimensions.get('window');
const STREAK_KEY = 'apex_streak_data';

// ── CARD ────────────────────────────────────────────────────
function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function CardHeader({ icon, title, hint }) {
  return (
    <View style={styles.cardHeader}>
      <View style={styles.cardHeaderLeft}>
        <View style={styles.cardIconBadge}>
          <Text style={{ fontSize: 14 }}>{icon}</Text>
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {hint && <Text style={styles.cardHint}>{hint}</Text>}
    </View>
  );
}

// ── ADHERENCE RING ──────────────────────────────────────────
function AdherenceRing({ percentage }) {
  const animVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animVal, {
      toValue: percentage,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const color = percentage >= 80 ? DT.lime : percentage >= 50 ? DT.carb : DT.danger;
  const label = percentage >= 80 ? 'Excellent' : percentage >= 50 ? 'Good' : 'Needs Work';

  return (
    <View style={styles.adherenceContainer}>
      <View style={[styles.adherenceRing, { borderColor: color }]}>
        <Text style={[styles.adherenceNum, { color }]}>{percentage}%</Text>
        <Text style={styles.adherenceLabel}>adherence</Text>
      </View>
      <View style={styles.adherenceInfo}>
        <Text style={[styles.adherenceGrade, { color }]}>{label}</Text>
        <Text style={styles.adherenceDesc}>
          Percentage of days you hit your calorie & macro targets this week
        </Text>
        <View style={[styles.adherenceBadge, { backgroundColor: color + '20', borderColor: color + '40' }]}>
          <Text style={[styles.adherenceBadgeText, { color }]}>
            {percentage >= 80 ? '🏆 Top Athlete' : percentage >= 50 ? '💪 Keep Going' : '📊 Start Tracking'}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ── HEATMAP CALENDAR ────────────────────────────────────────
function HeatmapCalendar({ loggedDates }) {
  const today = new Date();
  const days = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const str = d.toISOString().split('T')[0];
    days.push({ date: str, logged: loggedDates.includes(str) });
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <View>
      <View style={styles.heatmapRow}>
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.heatmapCol}>
            {week.map((day, di) => (
              <View
                key={di}
                style={[
                  styles.heatmapCell,
                  day.logged && styles.heatmapCellActive,
                  day.date === today.toISOString().split('T')[0] && styles.heatmapCellToday,
                ]}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.heatmapLegend}>
        <Text style={styles.heatmapLegendText}>Less</Text>
        <View style={[styles.heatmapCell, { margin: 2 }]} />
        <View style={[styles.heatmapCell, styles.heatmapCellActive, { margin: 2, opacity: 0.4 }]} />
        <View style={[styles.heatmapCell, styles.heatmapCellActive, { margin: 2, opacity: 0.7 }]} />
        <View style={[styles.heatmapCell, styles.heatmapCellActive, { margin: 2 }]} />
        <Text style={styles.heatmapLegendText}>More</Text>
      </View>
    </View>
  );
}

// ── MAIN SCREEN ─────────────────────────────────────────────
export default function ProgressScreen({ route, navigation }) {
  const athleteData = route?.params?.athleteData;
  const macros = route?.params?.macros;

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([]);
  const [stats, setStats] = useState({ total_days: 7, days_logged: 0 });
  const [loggedDates, setLoggedDates] = useState([]);
  const [streak, setStreak] = useState(0);
  const [waterHistory, setWaterHistory] = useState({ avg_ml: 0, days_hit: 0 });
  const [aiInsight, setAiInsight] = useState('');

  // Calendar state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [historyMeals, setHistoryMeals] = useState({});
  const [historyTotals, setHistoryTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      await Promise.all([
        loadProgressData(),
        loadLoggedDates(),
        loadStreakFromStorage(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadProgressData = async () => {
    try {
      const response = await mealsAPI.getWeeklyProgress();
      setWeeklyData(response.data.weekly_data || []);
      setStats({
        total_days: response.data.total_days || 7,
        days_logged: response.data.days_logged || 0,
      });
      generateAiInsight(response.data.weekly_data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadLoggedDates = async () => {
    try {
      const response = await mealsAPI.getLoggedDates();
      setLoggedDates(response.data.logged_dates || []);
      setStreak(response.data.streak || 0);
    } catch (e) {}
  };

  const loadStreakFromStorage = async () => {
    try {
      const raw = await AsyncStorage.getItem(STREAK_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setStreak(data.count || 0);
      }
    } catch (e) {}
  };

  const generateAiInsight = (data) => {
    if (!data || data.length === 0) {
      setAiInsight('Start logging meals to get personalized weekly insights from your AI Coach.');
      return;
    }
    const daysWithData = data.filter(d => d.calories > 0);
    if (daysWithData.length === 0) {
      setAiInsight('No meals logged this week. Start tracking to unlock AI-powered insights!');
      return;
    }
    const avgCalories = Math.round(daysWithData.reduce((s, d) => s + d.calories, 0) / daysWithData.length);
    const avgCarbs = Math.round(daysWithData.reduce((s, d) => s + d.carbs, 0) / daysWithData.length);
    const target = macros?.trainingDay?.calories || 2500;
    const carbTarget = macros?.trainingDay?.carbs || 300;

    if (avgCalories < target * 0.85) {
      setAiInsight(`You under-fueled on ${daysWithData.length} of ${data.length} days this week — averaging ${avgCalories} kcal vs your ${target} kcal target. Try adding a pre-workout snack to close the gap.`);
    } else if (avgCarbs < carbTarget * 0.8) {
      setAiInsight(`Your carb intake averaged ${avgCarbs}g vs your ${carbTarget}g target. As an endurance athlete, try +60g carbs pre-run to improve performance.`);
    } else {
      setAiInsight(`Great week! You averaged ${avgCalories} kcal/day with solid macro distribution. Keep up the consistency — your ${streak} day streak shows real commitment!`);
    }
  };

  const loadMealHistory = async (date) => {
    setHistoryLoading(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await mealsAPI.getByDate(dateStr);
      const meals = response.data;
      const grouped = { breakfast: [], lunch: [], dinner: [], snacks: [] };
      let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      meals.forEach(meal => {
        grouped[meal.meal_type]?.push(meal);
        totals.calories += meal.calories;
        totals.protein += meal.protein_g;
        totals.carbs += meal.carbs_g;
        totals.fat += meal.fat_g;
      });
      setHistoryMeals(grouped);
      setHistoryTotals(totals);
    } catch (e) {} finally {
      setHistoryLoading(false);
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => {
    const fd = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return fd === 0 ? 6 : fd - 1;
  };
  const isDateLogged = (day) => {
    const str = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return loggedDates.includes(str);
  };
  const isToday = (day) => {
    const t = new Date();
    return day === t.getDate() && currentMonth.getMonth() === t.getMonth() && currentMonth.getFullYear() === t.getFullYear();
  };
  const isSelected = (day) => day === selectedDate.getDate() && currentMonth.getMonth() === selectedDate.getMonth() && currentMonth.getFullYear() === selectedDate.getFullYear();
  const isFuture = (day) => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) > new Date();

  const handleDayPress = (day) => {
    if (isFuture(day)) return;
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(d);
    loadMealHistory(d);
  };

  const changeMonth = (dir) => {
    const nm = new Date(currentMonth);
    nm.setMonth(nm.getMonth() + dir);
    if (nm <= new Date()) setCurrentMonth(nm);
  };

  const formatDate = () => {
    const t = new Date();
    const y = new Date(t); y.setDate(t.getDate()-1);
    if (selectedDate.toDateString() === t.toDateString()) return 'Today';
    if (selectedDate.toDateString() === y.toDateString()) return 'Yesterday';
    return selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const adherence = Math.round((stats.days_logged / stats.total_days) * 100) || 0;

  const getCaloriesChartData = () => ({
    labels: weeklyData.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [
      { data: weeklyData.map(d => d.calories || 0), color: () => DT.lime, strokeWidth: 2 },
    ],
  });

  const getTrainingVsRestData = () => {
    const training = weeklyData.filter((_, i) => i % 2 === 0);
    const rest = weeklyData.filter((_, i) => i % 2 !== 0);
    const avgTraining = training.length ? Math.round(training.reduce((s, d) => s + (d.calories || 0), 0) / training.length) : 0;
    const avgRest = rest.length ? Math.round(rest.reduce((s, d) => s + (d.calories || 0), 0) / rest.length) : 0;
    return { avgTraining, avgRest };
  };

  const { avgTraining, avgRest } = getTrainingVsRestData();
  const trainingTarget = macros?.trainingDay?.calories || 2500;
  const restTarget = macros?.restDay?.calories || 2000;

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

    for (let i = 0; i < firstDay; i++) days.push(<View key={`e${i}`} style={styles.calDay} />);

    for (let day = 1; day <= daysInMonth; day++) {
      const logged = isDateLogged(day);
      const today = isToday(day);
      const selected = isSelected(day);
      const future = isFuture(day);
      days.push(
        <TouchableOpacity
          key={day}
          style={[styles.calDay, today && styles.calDayToday, selected && styles.calDaySelected, future && { opacity: 0.3 }]}
          onPress={() => handleDayPress(day)}
          disabled={future}
        >
          <Text style={[styles.calDayText, today && styles.calDayTodayText, selected && styles.calDaySelectedText, future && { color: DT.textTert }]}>
            {day}
          </Text>
          {logged && !selected && <View style={styles.calDot} />}
          {logged && selected && <View style={[styles.calDot, { backgroundColor: DT.lime }]} />}
        </TouchableOpacity>
      );
    }

    return (
      <View>
        <View style={styles.calNavRow}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.calNavBtn}>
            <Text style={styles.calNavBtnText}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.calMonthTitle}>
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity
            onPress={() => changeMonth(1)}
            style={[styles.calNavBtn, currentMonth.getMonth() === new Date().getMonth() && { opacity: 0.3 }]}
            disabled={currentMonth.getMonth() === new Date().getMonth()}
          >
            <Text style={styles.calNavBtnText}>▶</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.calWeekRow}>
          {weekDays.map(d => (
            <View key={d} style={styles.calDay}>
              <Text style={styles.calWeekText}>{d}</Text>
            </View>
          ))}
        </View>
        <View style={styles.calGrid}>{days}</View>
      </View>
    );
  };

  const renderMealGroup = (type, icon, label) => {
    const meals = historyMeals[type] || [];
    const cal = meals.reduce((s, m) => s + m.calories, 0);
    return (
      <View key={type} style={styles.mealGroup}>
        <View style={styles.mealGroupHeader}>
          <Text style={styles.mealGroupType}>{label.toUpperCase()}</Text>
          <Text style={styles.mealGroupCal}>{cal} kcal</Text>
        </View>
        {meals.length === 0 ? (
          <Text style={styles.mealGroupEmpty}>Nothing logged</Text>
        ) : meals.map((m, i) => (
          <View key={i} style={styles.mealItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.mealItemName}>{m.food_name}</Text>
              <Text style={styles.mealItemSub}>{m.calories} kcal · C {m.carbs_g}g · P {m.protein_g}g · F {m.fat_g}g</Text>
            </View>
          </View>
        ))}
        <View style={styles.mealGroupDivider} />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={DT.lime} />
        <Text style={styles.loaderText}>Loading your progress...</Text>
      </View>
    );
  }

  const chartConfig = {
    backgroundColor: DT.card,
    backgroundGradientFrom: DT.card,
    backgroundGradientTo: DT.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(203,255,71,${opacity})`,
    labelColor: () => DT.textSec,
    style: { borderRadius: 12 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: DT.lime },
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerMono}>ATHLETE ANALYTICS</Text>
          <Text style={styles.headerTitle}>Progress</Text>
        </View>
        <View style={[styles.streakPill, streak > 0 && styles.streakPillActive]}>
          <Text style={styles.streakPillText}>
            🔥 {streak > 0 ? `Day ${streak}` : 'Day 1'}
          </Text>
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabRow}>
        {['overview', 'charts', 'history'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => {
              setActiveTab(tab);
              if (tab === 'history') loadMealHistory(selectedDate);
            }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'overview' ? '📊 Overview' : tab === 'charts' ? '📈 Charts' : '📅 History'}
            </Text>
            {activeTab === tab && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <>
              {/* ADHERENCE SCORE - HERO */}
              <Card>
                <CardHeader icon="🎯" title="Adherence Score" hint="THIS WEEK" />
                <AdherenceRing percentage={adherence} />
              </Card>

              {/* AI WEEKLY INSIGHT */}
              <Card style={styles.insightCard}>
                <CardHeader icon="🤖" title="Weekly Insight" hint="AI POWERED" />
                <Text style={styles.insightText}>{aiInsight}</Text>
                <TouchableOpacity
                  style={styles.insightBtn}
                  onPress={() => navigation.navigate('AICoach', { preloadedMessage: aiInsight })}><Text style={styles.insightBtnText}>Ask AI Coach about this →</Text>
                </TouchableOpacity>
                
              </Card>

              {/* TRAINING VS REST SPLIT */}
              <Card>
                <CardHeader icon="⚡" title="Training vs Rest Split" hint="AVG INTAKE" />
                <Text style={styles.splitSubtitle}>Did you actually eat more on hard days?</Text>
                <View style={styles.splitRow}>
                  {/* Training Day */}
                  <View style={styles.splitItem}>
                    <Text style={styles.splitLabel}>🏋️ TRAINING</Text>
                    <Text style={[styles.splitNum, { color: DT.lime }]}>{avgTraining}</Text>
                    <Text style={styles.splitUnit}>kcal avg</Text>
                    <View style={styles.splitBarTrack}>
                      <View style={[styles.splitBarFill, {
                        width: `${Math.min((avgTraining / trainingTarget) * 100, 100)}%`,
                        backgroundColor: DT.lime,
                      }]} />
                    </View>
                    <Text style={styles.splitTarget}>Target: {trainingTarget}</Text>
                    <View style={[styles.splitBadge, {
                      backgroundColor: avgTraining >= trainingTarget * 0.9 ? DT.lime + '20' : DT.danger + '20',
                      borderColor: avgTraining >= trainingTarget * 0.9 ? DT.lime + '40' : DT.danger + '40',
                    }]}>
                      <Text style={[styles.splitBadgeText, {
                        color: avgTraining >= trainingTarget * 0.9 ? DT.lime : DT.danger,
                      }]}>
                        {avgTraining >= trainingTarget * 0.9 ? '✓ On Target' : '↓ Under-fueled'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.splitDivider} />

                  {/* Rest Day */}
                  <View style={styles.splitItem}>
                    <Text style={styles.splitLabel}>😴 REST</Text>
                    <Text style={[styles.splitNum, { color: DT.fat }]}>{avgRest}</Text>
                    <Text style={styles.splitUnit}>kcal avg</Text>
                    <View style={styles.splitBarTrack}>
                      <View style={[styles.splitBarFill, {
                        width: `${Math.min((avgRest / restTarget) * 100, 100)}%`,
                        backgroundColor: DT.fat,
                      }]} />
                    </View>
                    <Text style={styles.splitTarget}>Target: {restTarget}</Text>
                    <View style={[styles.splitBadge, {
                      backgroundColor: avgRest >= restTarget * 0.9 ? DT.lime + '20' : DT.danger + '20',
                      borderColor: avgRest >= restTarget * 0.9 ? DT.lime + '40' : DT.danger + '40',
                    }]}>
                      <Text style={[styles.splitBadgeText, {
                        color: avgRest >= restTarget * 0.9 ? DT.lime : DT.danger,
                      }]}>
                        {avgRest >= restTarget * 0.9 ? '✓ On Target' : '↓ Under-fueled'}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>

              {/* STREAK HEATMAP */}
              <Card>
                <CardHeader icon="🔥" title="Logging Streak" hint="LAST 90 DAYS" />
                <View style={styles.streakSummary}>
                  <View style={styles.streakStatItem}>
                    <Text style={[styles.streakStatNum, { color: DT.lime }]}>
                      {streak > 0 ? `Day ${streak}` : 'Day 1'}
                    </Text>
                    <Text style={styles.streakStatLabel}>CURRENT</Text>
                  </View>
                  <View style={styles.streakStatItem}>
                    <Text style={[styles.streakStatNum, { color: DT.carb }]}>{loggedDates.length}</Text>
                    <Text style={styles.streakStatLabel}>TOTAL DAYS</Text>
                  </View>
                  <View style={styles.streakStatItem}>
                    <Text style={[styles.streakStatNum, { color: DT.fat }]}>{adherence}%</Text>
                    <Text style={styles.streakStatLabel}>THIS WEEK</Text>
                  </View>
                </View>
                <HeatmapCalendar loggedDates={loggedDates} />
              </Card>

              {/* WEIGHT TRACKING */}
              <Card>
                <CardHeader icon="⚖️" title="Weight Trend" hint="7-DAY AVG" />
                <View style={styles.weightDisplay}>
                  <Text style={styles.weightNum}>{athleteData?.weight || '--'}</Text>
                  <Text style={styles.weightUnit}>kg</Text>
                </View>
                <Text style={styles.weightSub}>
                  Update your weight in Profile to track progress over time
                </Text>
                <View style={styles.weightRow}>
                  <View style={styles.weightStat}>
                    <Text style={styles.weightStatLabel}>CURRENT</Text>
                    <Text style={[styles.weightStatVal, { color: DT.lime }]}>{athleteData?.weight || '--'} kg</Text>
                  </View>
                  <View style={styles.weightStat}>
                    <Text style={styles.weightStatLabel}>BMI</Text>
                    <Text style={[styles.weightStatVal, { color: DT.fat }]}>
                      {athleteData?.weight && athleteData?.height
                        ? (athleteData.weight / ((athleteData.height / 100) ** 2)).toFixed(1)
                        : '--'}
                    </Text>
                  </View>
                  <View style={styles.weightStat}>
                    <Text style={styles.weightStatLabel}>BMR</Text>
                    <Text style={[styles.weightStatVal, { color: DT.carb }]}>{macros?.bmr || '--'} kcal</Text>
                  </View>
                </View>
              </Card>
            </>
          )}

          {/* ── CHARTS TAB ── */}
          {activeTab === 'charts' && (
            <>
              {/* CALORIE TREND */}
              <Card>
                <CardHeader icon="🔥" title="7-Day Calorie Trend" hint="VS TARGET" />
                {weeklyData.some(d => d.calories > 0) ? (
                  <>
                    <LineChart
                      data={getCaloriesChartData()}
                      width={width - 80}
                      height={200}
                      chartConfig={chartConfig}
                      bezier
                      style={{ borderRadius: 12, marginTop: 8 }}
                    />
                    <View style={styles.chartLegend}>
                      <View style={styles.chartLegendItem}>
                        <View style={[styles.chartLegendDot, { backgroundColor: DT.lime }]} />
                        <Text style={styles.chartLegendText}>Calories consumed</Text>
                      </View>
                      <View style={styles.chartLegendItem}>
                        <View style={[styles.chartLegendDot, { backgroundColor: DT.textSec }]} />
                        <Text style={styles.chartLegendText}>Target: {trainingTarget} kcal</Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <View style={styles.emptyChart}>
                    <Text style={styles.emptyChartIcon}>📊</Text>
                    <Text style={styles.emptyChartText}>No data yet</Text>
                    <Text style={styles.emptyChartSub}>Log meals to see your calorie trend</Text>
                  </View>
                )}
              </Card>

              {/* MACRO BREAKDOWN */}
              <Card>
                <CardHeader icon="📈" title="Weekly Macro Totals" hint="GRAMS" />
                <View style={styles.macroBreakdown}>
                  {[
                    { label: 'Carbs', val: weeklyData.reduce((s, d) => s + (d.carbs || 0), 0), color: DT.carb, target: (macros?.trainingDay?.carbs || 0) * 7 },
                    { label: 'Protein', val: weeklyData.reduce((s, d) => s + (d.protein || 0), 0), color: DT.protein, target: (macros?.trainingDay?.protein || 0) * 7 },
                    { label: 'Fat', val: weeklyData.reduce((s, d) => s + (d.fat || 0), 0), color: DT.fat, target: (macros?.trainingDay?.fat || 0) * 7 },
                  ].map(m => (
                    <View key={m.label} style={styles.macroBreakdownItem}>
                      <View style={styles.macroBreakdownTop}>
                        <Text style={styles.macroBreakdownLabel}>{m.label}</Text>
                        <Text style={[styles.macroBreakdownVal, { color: m.color }]}>{m.val}g</Text>
                      </View>
                      <View style={styles.macroBreakdownBar}>
                        <View style={[styles.macroBreakdownFill, {
                          width: `${Math.min((m.val / m.target) * 100, 100)}%`,
                          backgroundColor: m.color,
                        }]} />
                      </View>
                      <Text style={styles.macroBreakdownTarget}>Target: {m.target}g/week</Text>
                    </View>
                  ))}
                </View>
              </Card>

              {/* WEEKLY SUMMARY TABLE */}
              <Card>
                <CardHeader icon="📋" title="Daily Breakdown" hint="THIS WEEK" />
                {weeklyData.map((day, i) => {
                  const date = new Date(day.date);
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const hasData = day.calories > 0;
                  const pct = hasData ? Math.round((day.calories / trainingTarget) * 100) : 0;
                  return (
                    <View key={i} style={styles.summaryRow}>
                      <Text style={styles.summaryDay}>{dayName}</Text>
                      <View style={styles.summaryBar}>
                        <View style={[styles.summaryBarFill, {
                          width: `${Math.min(pct, 100)}%`,
                          backgroundColor: pct >= 90 ? DT.lime : pct >= 70 ? DT.carb : DT.danger,
                        }]} />
                      </View>
                      {hasData ? (
                        <Text style={styles.summaryVal}>{day.calories} kcal</Text>
                      ) : (
                        <Text style={styles.summaryEmpty}>—</Text>
                      )}
                    </View>
                  );
                })}
              </Card>
            </>
          )}

          {/* ── HISTORY TAB ── */}
          {activeTab === 'history' && (
            <>
              {/* CALENDAR */}
              <Card>
                <CardHeader icon="📅" title="Meal History" hint="" />
                {renderCalendar()}
              </Card>

              {/* SELECTED DAY */}
              <Card>
                <CardHeader icon="🍽️" title={formatDate()} hint="" />
                {historyLoading ? (
                  <ActivityIndicator size="small" color={DT.lime} style={{ marginVertical: 20 }} />
                ) : historyTotals.calories > 0 ? (
                  <>
                    <View style={styles.historyTotals}>
                      <View style={styles.historyTotalMain}>
                        <Text style={styles.historyTotalNum}>{historyTotals.calories}</Text>
                        <Text style={styles.historyTotalLabel}>kcal</Text>
                      </View>
                      <View style={styles.historyMacros}>
                        {[
                          { label: 'C', val: historyTotals.carbs, color: DT.carb },
                          { label: 'P', val: historyTotals.protein, color: DT.protein },
                          { label: 'F', val: historyTotals.fat, color: DT.fat },
                        ].map(m => (
                          <View key={m.label} style={styles.historyMacroItem}>
                            <Text style={[styles.historyMacroVal, { color: m.color }]}>{m.val}g</Text>
                            <Text style={styles.historyMacroLabel}>{m.label}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    <View style={styles.historyDivider} />
                    {renderMealGroup('breakfast', '🌅', 'Breakfast')}
                    {renderMealGroup('lunch', '☀️', 'Lunch')}
                    {renderMealGroup('dinner', '🌙', 'Dinner')}
                    {renderMealGroup('snacks', '🍎', 'Snacks')}
                  </>
                ) : (
                  <View style={styles.emptyDay}>
                    <Text style={styles.emptyDayIcon}>🍽️</Text>
                    <Text style={styles.emptyDayText}>No meals logged</Text>
                    <Text style={styles.emptyDaySub}>Tap a green dot to view logged days</Text>
                  </View>
                )}
              </Card>
            </>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DT.bg },
  loader: { flex: 1, backgroundColor: DT.bg, justifyContent: 'center', alignItems: 'center' },
  loaderText: { color: DT.textSec, marginTop: 12, fontSize: 14 },

  // HEADER
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: DT.border,
  },
  headerMono: { fontSize: 10, color: DT.lime, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: DT.text, letterSpacing: -0.5 },
  streakPill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: DT.border, backgroundColor: DT.card,
  },
  streakPillActive: { borderColor: 'rgba(203,255,71,0.4)', backgroundColor: 'rgba(203,255,71,0.1)' },
  streakPillText: { fontSize: 14, fontWeight: '700', color: DT.lime },

  // TABS
  tabRow: {
    flexDirection: 'row', paddingHorizontal: 24,
    borderBottomWidth: 1, borderBottomColor: DT.border, marginBottom: 16,
  },
  tab: { paddingVertical: 12, paddingHorizontal: 4, marginRight: 20, position: 'relative' },
  tabActive: {},
  tabText: { fontSize: 14, color: DT.textSec, fontWeight: '500' },
  tabTextActive: { color: DT.text, fontWeight: '700' },
  tabUnderline: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: DT.lime, borderRadius: 2 },

  // CONTENT
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16 },

  // CARD
  card: { backgroundColor: DT.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: DT.border, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIconBadge: { width: 32, height: 32, borderRadius: 8, backgroundColor: DT.limeDim, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: DT.text },
  cardHint: { fontSize: 9, color: DT.textSec, fontWeight: '600', letterSpacing: 1.2 },

  // ADHERENCE
  adherenceContainer: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  adherenceRing: {
    width: 110, height: 110, borderRadius: 55, borderWidth: 8,
    justifyContent: 'center', alignItems: 'center', backgroundColor: DT.bg,
  },
  adherenceNum: { fontSize: 26, fontWeight: '800', letterSpacing: -1 },
  adherenceLabel: { fontSize: 10, color: DT.textSec, fontWeight: '500' },
  adherenceInfo: { flex: 1 },
  adherenceGrade: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6 },
  adherenceDesc: { fontSize: 12, color: DT.textSec, lineHeight: 18, marginBottom: 10 },
  adherenceBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start' },
  adherenceBadgeText: { fontSize: 12, fontWeight: '700' },

  // AI INSIGHT
  insightCard: { borderColor: 'rgba(203,255,71,0.2)', backgroundColor: 'rgba(203,255,71,0.04)' },
  insightText: { fontSize: 14, color: DT.text, lineHeight: 22, marginBottom: 14 },
  insightBtn: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: DT.border },
  insightBtnText: { fontSize: 13, color: DT.lime, fontWeight: '600' },

  // TRAINING VS REST SPLIT
  splitSubtitle: { fontSize: 12, color: DT.textSec, marginBottom: 16 },
  splitRow: { flexDirection: 'row', gap: 12 },
  splitItem: { flex: 1, alignItems: 'center' },
  splitLabel: { fontSize: 9, color: DT.textSec, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  splitNum: { fontSize: 36, fontWeight: '800', letterSpacing: -1.5 },
  splitUnit: { fontSize: 12, color: DT.textSec, marginBottom: 10 },
  splitBarTrack: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  splitBarFill: { height: '100%', borderRadius: 3 },
  splitTarget: { fontSize: 10, color: DT.textTert, marginBottom: 8 },
  splitBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  splitBadgeText: { fontSize: 11, fontWeight: '700' },
  splitDivider: { width: 1, backgroundColor: DT.border, alignSelf: 'stretch', marginHorizontal: 4 },

  // STREAK HEATMAP
  streakSummary: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: DT.border },
  streakStatItem: { alignItems: 'center' },
  streakStatNum: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  streakStatLabel: { fontSize: 9, color: DT.textSec, fontWeight: '600', letterSpacing: 1.2, marginTop: 4 },
  heatmapRow: { flexDirection: 'row', gap: 3 },
  heatmapCol: { flexDirection: 'column', gap: 3 },
  heatmapCell: { width: 10, height: 10, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.06)' },
  heatmapCellActive: { backgroundColor: DT.lime },
  heatmapCellToday: { borderWidth: 1, borderColor: DT.lime },
  heatmapLegend: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  heatmapLegendText: { fontSize: 10, color: DT.textSec },

  // WEIGHT
  weightDisplay: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  weightNum: { fontSize: 52, fontWeight: '800', color: DT.text, letterSpacing: -2 },
  weightUnit: { fontSize: 18, color: DT.textSec, marginLeft: 6 },
  weightSub: { fontSize: 12, color: DT.textSec, marginBottom: 16 },
  weightRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12, borderTopWidth: 1, borderTopColor: DT.border },
  weightStat: { alignItems: 'center' },
  weightStatLabel: { fontSize: 9, color: DT.textSec, fontWeight: '600', letterSpacing: 1.2, marginBottom: 4 },
  weightStatVal: { fontSize: 18, fontWeight: '700' },

  // CHART LEGEND
  chartLegend: { flexDirection: 'row', gap: 16, marginTop: 8 },
  chartLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chartLegendDot: { width: 8, height: 8, borderRadius: 4 },
  chartLegendText: { fontSize: 11, color: DT.textSec },

  // MACRO BREAKDOWN
  macroBreakdown: { gap: 14, marginTop: 8 },
  macroBreakdownItem: {},
  macroBreakdownTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  macroBreakdownLabel: { fontSize: 13, fontWeight: '600', color: DT.text },
  macroBreakdownVal: { fontSize: 13, fontWeight: '700' },
  macroBreakdownBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  macroBreakdownFill: { height: '100%', borderRadius: 3 },
  macroBreakdownTarget: { fontSize: 10, color: DT.textTert },

  // SUMMARY ROWS
  summaryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: DT.border, gap: 10 },
  summaryDay: { fontSize: 12, fontWeight: '600', color: DT.textSec, width: 32 },
  summaryBar: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  summaryBarFill: { height: '100%', borderRadius: 3 },
  summaryVal: { fontSize: 12, fontWeight: '600', color: DT.text, width: 70, textAlign: 'right' },
  summaryEmpty: { fontSize: 12, color: DT.textTert, width: 70, textAlign: 'right' },

  // EMPTY CHART
  emptyChart: { alignItems: 'center', paddingVertical: 32 },
  emptyChartIcon: { fontSize: 40, marginBottom: 10 },
  emptyChartText: { fontSize: 16, fontWeight: '700', color: DT.text, marginBottom: 4 },
  emptyChartSub: { fontSize: 13, color: DT.textSec },

  // CALENDAR
  calNavRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  calNavBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: DT.cardAlt, justifyContent: 'center', alignItems: 'center' },
  calNavBtnText: { fontSize: 12, color: DT.lime, fontWeight: '700' },
  calMonthTitle: { fontSize: 15, fontWeight: '700', color: DT.text },
  calWeekRow: { flexDirection: 'row', marginBottom: 4 },
  calWeekText: { fontSize: 10, color: DT.textSec, fontWeight: '600', textAlign: 'center' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calDay: { width: `${100/7}%`, aspectRatio: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 2 },
  calDayToday: { backgroundColor: 'rgba(203,255,71,0.1)', borderRadius: 20, borderWidth: 1, borderColor: DT.lime },
  calDaySelected: { backgroundColor: DT.lime, borderRadius: 20 },
  calDayText: { fontSize: 13, color: DT.text, fontWeight: '500' },
  calDayTodayText: { color: DT.lime, fontWeight: '700' },
  calDaySelectedText: { color: DT.bg, fontWeight: '800' },
  calDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: DT.success, position: 'absolute', bottom: 3 },

  // HISTORY
  historyTotals: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 16 },
  historyTotalMain: { alignItems: 'center' },
  historyTotalNum: { fontSize: 48, fontWeight: '800', color: DT.text, letterSpacing: -2 },
  historyTotalLabel: { fontSize: 12, color: DT.textSec },
  historyMacros: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  historyMacroItem: { alignItems: 'center' },
  historyMacroVal: { fontSize: 20, fontWeight: '700' },
  historyMacroLabel: { fontSize: 10, color: DT.textSec, marginTop: 2 },
  historyDivider: { height: 1, backgroundColor: DT.border, marginBottom: 12 },
  mealGroup: { marginBottom: 8 },
  mealGroupHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  mealGroupType: { fontSize: 9, color: DT.lime, fontWeight: '700', letterSpacing: 1.5 },
  mealGroupCal: { fontSize: 12, color: DT.textSec, fontWeight: '500' },
  mealGroupEmpty: { fontSize: 12, color: DT.textTert, fontStyle: 'italic', paddingLeft: 8, paddingBottom: 8 },
  mealItem: { paddingVertical: 6, paddingLeft: 12 },
  mealItemName: { fontSize: 13, fontWeight: '500', color: DT.text },
  mealItemSub: { fontSize: 11, color: DT.textSec, marginTop: 2 },
  mealGroupDivider: { height: 1, backgroundColor: DT.border, marginTop: 6 },
  emptyDay: { alignItems: 'center', paddingVertical: 32 },
  emptyDayIcon: { fontSize: 40, marginBottom: 10 },
  emptyDayText: { fontSize: 16, fontWeight: '700', color: DT.text, marginBottom: 4 },
  emptyDaySub: { fontSize: 13, color: DT.textSec },
});