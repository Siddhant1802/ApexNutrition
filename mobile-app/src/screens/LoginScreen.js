import { showToast } from '../components/Toast';
import { validateEmail } from '../utils/validation';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, athleteAPI } from '../services/api';
import { SPORTS } from '../constants/sports';
import { DT } from '../constants/darkTheme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(email, password);
      const { access_token } = response.data;
      await AsyncStorage.setItem('token', access_token);
      showToast('Logged in successfully!', 'success');

      setTimeout(async () => {
        try {
          const profileResponse = await athleteAPI.getProfile();
          const profile = profileResponse.data;
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

          navigation.replace('Home', {
            screen: 'HomeTab',
            params: {
              athleteData,
              macros,
              sport: sport || { id: profile.primary_sport, name: profile.primary_sport, icon: '🏃' }
            }
          });
        } catch (error) {
          navigation.replace('SportSelection');
        }
      }, 1500);

    } catch (error) {
      if (error.response?.status === 401) {
        setError('Invalid email or password');
      } else if (error.response?.status === 404) {
        setError('Account not found. Please sign up.');
      } else if (error.message === 'Network Error') {
        setError('Cannot connect to server. Is backend running?');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* HEADER SECTION */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>⚡</Text>
            </View>
            <Text style={styles.title}>APEX NUTRITION</Text>
            <Text style={styles.subtitle}>
              AI-powered sport nutrition for competitive athletes
            </Text>
          </View>

          {/* LOGIN CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>
              Sign in to continue your nutrition journey
            </Text>

            {/* ERROR MESSAGE */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* EMAIL INPUT */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>EMAIL</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={DT.textTert}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError(null); }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* PASSWORD INPUT */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={DT.textTert}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setError(null); }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* LOGIN BUTTON */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={DT.bg} size="small" />
              ) : (
                <Text style={styles.loginButtonText}>SIGN IN →</Text>
              )}
            </TouchableOpacity>

            {/* DIVIDER */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            {/* REGISTER LINK */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}> Create one</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* BOTTOM SECTION */}
          <View style={styles.bottomSection}>
            <Text style={styles.termsText}>
              By signing in, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DT.bg,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },

  // HEADER
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: DT.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: DT.limeDim,
  },
  logoText: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: DT.text,
    letterSpacing: 3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: DT.textSec,
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 20,
  },

  // CARD
  card: {
    backgroundColor: DT.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: DT.border,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: DT.text,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: DT.textSec,
    marginBottom: 24,
  },

  // ERROR
  errorContainer: {
    backgroundColor: 'rgba(224, 90, 90, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: DT.danger,
  },
  errorText: {
    color: DT.danger,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },

  // INPUTS
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: DT.textSec,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DT.cardAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DT.border,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: DT.text,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 16,
  },

  // LOGIN BUTTON
  loginButton: {
    backgroundColor: DT.lime,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: DT.bg,
    letterSpacing: 1,
  },

  // DIVIDER
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: DT.border,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: DT.textTert,
    marginHorizontal: 16,
    letterSpacing: 1,
  },

  // REGISTER
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: 14,
    fontWeight: '500',
    color: DT.textSec,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: DT.lime,
  },

  // BOTTOM
  bottomSection: {
    marginTop: 32,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    fontWeight: '500',
    color: DT.textTert,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: DT.textSec,
    fontWeight: '600',
  },
});