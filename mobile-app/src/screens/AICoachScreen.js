import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mealsAPI, athleteAPI } from '../services/api';
import { DT } from '../constants/darkTheme';

export default function AICoachScreen({ route }) {
  const preloadedMessage = route?.params?.preloadedMessage;

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your personal AI Nutrition Coach! 🏃‍♂️\n\nI have access to your nutrition data, sport profile, and daily progress. Ask me anything about your nutrition!\n\nFor example:\n• Am I on track today?\n• What should I eat for dinner?\n• How's my protein this week?\n• What should I eat before my marathon?",
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState(null);
  const [contextLoading, setContextLoading] = useState(true);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    loadUserContext();
  }, []);

  // Handle preloaded message from Progress screen
  useEffect(() => {
    if (preloadedMessage && !contextLoading) {
      setInput(`I got this weekly insight: "${preloadedMessage}" — can you give me more specific advice on how to improve?`);
    }
  }, [preloadedMessage, contextLoading]);

  const loadUserContext = async () => {
    try {
      const [profileResponse, mealsResponse, progressResponse] = await Promise.all([
        athleteAPI.getProfile(),
        mealsAPI.getToday(),
        mealsAPI.getWeeklyProgress(),
      ]);

      const profile = profileResponse.data;
      const todayMeals = mealsResponse.data;
      const weeklyProgress = progressResponse.data;

      const todayTotals = todayMeals.reduce((acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein_g,
        carbs: acc.carbs + meal.carbs_g,
        fat: acc.fat + meal.fat_g,
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

      setContext({
        sport: profile.primary_sport,
        training_phase: profile.training_phase,
        weight_kg: profile.weight_kg,
        today: { totals: todayTotals },
        targets: {
          training_day: {
            calories: profile.training_day_calories,
            protein: profile.training_day_protein_g,
            carbs: profile.training_day_carbs_g,
            fat: profile.training_day_fat_g,
          },
        },
      });
    } catch (error) {
      console.error('Error loading context:', error);
    } finally {
      setContextLoading(false);
    }
  };

  const sendMessage = async (overrideInput) => {
    const messageText = overrideInput || input;
    if (!messageText.trim() || loading) return;

    const userMessage = { role: 'user', content: messageText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const conversationHistory = updatedMessages
        .slice(1)
        .map(m => ({ role: m.role, content: m.content }));

      const token = await AsyncStorage.getItem('token');

      const response = await fetch('http://localhost:8000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed');

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble connecting. Please try again! 🔄',
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const quickQuestions = [
    "Am I on track today? 📊",
    "What should I eat for dinner? 🍽️",
    "How's my protein this week? 💪",
    "Pre-workout meal suggestion? ⚡",
    "Am I eating enough carbs? 🍞",
    "How can I improve recovery? 🔄",
  ];

  if (contextLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={DT.lime} />
        <Text style={styles.loaderText}>Loading your nutrition data...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerMono}>AI POWERED · CLAUDE</Text>
          <Text style={styles.headerTitle}>Nutrition Coach</Text>
        </View>
        {context && (
          <View style={styles.contextPill}>
            <Text style={styles.contextPillText}>
              🔥 {context.today.totals.calories} / {context.targets.training_day.calories} kcal
            </Text>
          </View>
        )}
      </View>

      {/* CONTEXT BAR */}
      {context && (
        <View style={styles.contextBar}>
          <Text style={styles.contextBarText}>
            🏃 {context.sport}
          </Text>
          <View style={styles.contextBarDot} />
          <Text style={styles.contextBarText}>
            Phase: {context.training_phase || 'Base'}
          </Text>
          <View style={styles.contextBarDot} />
          <Text style={styles.contextBarText}>
            {context.weight_kg}kg
          </Text>
        </View>
      )}

      {/* MESSAGES */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, i) => (
          <View
            key={i}
            style={[
              styles.bubble,
              msg.role === 'user' ? styles.userBubble : styles.aiBubble,
            ]}
          >
            {msg.role === 'assistant' && (
              <View style={styles.aiLabelRow}>
                <View style={styles.aiLabelDot} />
                <Text style={styles.aiLabel}>AI Coach</Text>
              </View>
            )}
            <Text style={[
              styles.bubbleText,
              msg.role === 'user' ? styles.userBubbleText : styles.aiBubbleText,
            ]}>
              {msg.content}
            </Text>
          </View>
        ))}

        {loading && (
          <View style={styles.loadingBubble}>
            <ActivityIndicator size="small" color={DT.lime} />
            <Text style={styles.loadingBubbleText}>AI is thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* QUICK QUESTIONS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickRow}
        contentContainerStyle={styles.quickRowContent}
      >
        {quickQuestions.map((q, i) => (
          <TouchableOpacity
            key={i}
            style={styles.quickBtn}
            onPress={() => sendMessage(q)}
          >
            <Text style={styles.quickBtnText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* INPUT */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask your AI coach anything..."
          placeholderTextColor={DT.textTert}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    backgroundColor: DT.bg,
  },
  headerMono: { fontSize: 10, color: DT.lime, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: DT.text, letterSpacing: -0.5 },
  contextPill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(203,255,71,0.3)',
    backgroundColor: 'rgba(203,255,71,0.08)',
  },
  contextPillText: { fontSize: 12, color: DT.lime, fontWeight: '600' },

  // CONTEXT BAR
  contextBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: DT.card,
    borderBottomWidth: 1, borderBottomColor: DT.border,
  },
  contextBarText: { fontSize: 12, color: DT.textSec, fontWeight: '500' },
  contextBarDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: DT.textTert },

  // MESSAGES
  messages: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 24, gap: 12 },

  bubble: {
    maxWidth: '85%', padding: 14, borderRadius: 16,
  },
  userBubble: {
    backgroundColor: DT.lime, alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: DT.card, alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: DT.border,
  },
  aiLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  aiLabelDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: DT.lime },
  aiLabel: { fontSize: 10, color: DT.lime, fontWeight: '700', letterSpacing: 1 },
  bubbleText: { fontSize: 14, lineHeight: 22 },
  userBubbleText: { color: DT.bg, fontWeight: '500' },
  aiBubbleText: { color: DT.text },

  loadingBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: DT.card, padding: 14, borderRadius: 16,
    alignSelf: 'flex-start', borderWidth: 1, borderColor: DT.border,
  },
  loadingBubbleText: { fontSize: 13, color: DT.textSec },

  // QUICK QUESTIONS
  quickRow: {
    maxHeight: 50, borderTopWidth: 1, borderTopColor: DT.border,
    backgroundColor: DT.bg,
  },
  quickRowContent: { padding: 8, gap: 8 },
  quickBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: DT.border,
    backgroundColor: DT.card,
  },
  quickBtnText: { fontSize: 12, color: DT.lime, fontWeight: '500' },

  // INPUT
  inputRow: {
    flexDirection: 'row', padding: 12,
    borderTopWidth: 1, borderTopColor: DT.border,
    gap: 10, alignItems: 'flex-end',
    backgroundColor: DT.bg,
  },
  input: {
    flex: 1, backgroundColor: DT.card,
    borderRadius: 14, padding: 12,
    fontSize: 14, color: DT.text,
    borderWidth: 1, borderColor: DT.border,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: DT.lime, borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: DT.bg, fontSize: 14, fontWeight: '700' },
});