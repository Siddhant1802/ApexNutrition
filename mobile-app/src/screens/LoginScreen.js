import { showToast } from '../components/Toast';
import AnimatedBackground from '../components/AnimatedBackground';
import { validateEmail } from '../utils/validation';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, athleteAPI } from '../services/api';
import { SPORTS } from '../constants/sports';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // 1. Check if fields are filled
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    // 2. Validate email format
    if (!validateEmail(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { access_token } = response.data;
      
      // Save token
      await AsyncStorage.setItem('token', access_token);
      
      showToast('Logged in successfully!', 'success');
      
      // Check if user has a profile
      setTimeout(async () => {
        try {
          // Try to fetch profile
          const profileResponse = await athleteAPI.getProfile();
          const profile = profileResponse.data;

          // Profile exists - load data and go to Home
          const sport = SPORTS.find(s => s.id === profile.primary_sport);

          const athleteData = {
            weight: profile.weight_kg,
            height: profile.height_cm,
            age: profile.age,
            gender: profile.gender,
            bodyFat: null,
            activityLevel: 'moderate',
            trainingPhase: profile.training_phase,
          };

          const macros = {
            bmr: profile.bmr,
            tdee: profile.tdee,
            trainingDay: {
              calories: profile.training_day_calories,
              protein: profile.training_day_protein_g,
              carbs: profile.training_day_carbs_g,
              fat: profile.training_day_fat_g,
            },
            restDay: {
              calories: profile.rest_day_calories,
              protein: profile.rest_day_protein_g,
              carbs: profile.rest_day_carbs_g,
              fat: profile.rest_day_fat_g,
            },
            macroRatios: sport?.macroRatio || { protein: 20, carbs: 55, fat: 25 },
          };

          // Navigate to Home with data
          navigation.replace('Home', {
            screen: 'HomeTab',
            params: { athleteData, macros, sport: sport || { id: profile.primary_sport, name: profile.primary_sport, icon: '🏃' } }
          });

        } catch (error) {
          // No profile found - go to Sport Selection
          if (error.response?.status === 404) {
            navigation.replace('SportSelection');
          } else {
            // Other error - still go to Sport Selection
            navigation.replace('SportSelection');
          }
        }
      }, 1500);
      
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      
      // Handle specific errors
      if (error.response?.status === 401) {
        showToast('Invalid email or password', 'error');
      } else if (error.response?.status === 404) {
        showToast('Account not registered. Please sign up first.', 'error');
      } else if (error.message === 'Network Error') {
        showToast('Cannot connect to server. Is backend running?', 'error');
      } else {
        showToast('Login failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <AnimatedBackground variant="blue" />
      <View style={styles.content}>
        {/* Logo/Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Apex Nutrition</Text>
          <Text style={styles.subtitle}>Elite Athlete Nutrition</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Social Login Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Buttons */}
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => showToast('Google login coming soon!', 'info')}
          >
            <Text style={styles.socialButtonText}>🔍 Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => showToast('Apple login coming soon!', 'info')}
          >
            <Text style={styles.socialButtonText}>🍎 Continue with Apple</Text>
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl * 2,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
  },
  socialButton: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  socialButtonText: {
    color: COLORS.text,
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
  },
  link: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
});