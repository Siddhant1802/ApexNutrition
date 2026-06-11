import { validatePassword, validateEmail } from '../utils/validation';
import { showToast } from '../components/Toast';
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
  ScrollView,
} from 'react-native';
import { authAPI } from '../services/api';
import { DT } from '../constants/darkTheme';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0]);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authAPI.register(email, password, fullName);
      showToast('Account created! Please login.', 'success');
      setTimeout(() => navigation.navigate('Login'), 1500);
    } catch (error) {
      setError(error.response?.data?.detail || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  const passwordChecks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
    { label: 'One special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>⚡</Text>
          </View>
          <Text style={styles.title}>APEX NUTRITION</Text>
          <Text style={styles.subtitle}>
            AI-powered sport nutrition for competitive athletes
          </Text>
        </View>

        {/* CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Account</Text>
          <Text style={styles.cardSubtitle}>
            Join thousands of athletes optimizing their nutrition
          </Text>

          {/* ERROR */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* FULL NAME */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor={DT.textTert}
                value={fullName}
                onChangeText={(t) => { setFullName(t); setError(null); }}
              />
            </View>
          </View>

          {/* EMAIL */}
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
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* PASSWORD */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a strong password"
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

          {/* PASSWORD STRENGTH */}
          {password.length > 0 && (
            <View style={styles.passwordStrength}>
              <Text style={styles.strengthTitle}>PASSWORD REQUIREMENTS</Text>
              {passwordChecks.map((check, i) => (
                <View key={i} style={styles.requirementRow}>
                  <View style={[styles.requirementDot, check.met && styles.requirementDotMet]} />
                  <Text style={[styles.requirementText, check.met && styles.requirementTextMet]}>
                    {check.label}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* CONFIRM PASSWORD */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
            <View style={[
              styles.inputWrapper,
              confirmPassword.length > 0 && {
                borderColor: confirmPassword === password ? DT.lime + '60' : DT.danger + '60'
              }
            ]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Repeat your password"
                placeholderTextColor={DT.textTert}
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setError(null); }}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirm(!showConfirm)}
                style={styles.eyeButton}
              >
                <Text style={styles.eyeIcon}>{showConfirm ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {confirmPassword.length > 0 && (
              <Text style={[
                styles.matchText,
                { color: confirmPassword === password ? DT.lime : DT.danger }
              ]}>
                {confirmPassword === password ? '✓ Passwords match' : '✗ Passwords do not match'}
              </Text>
            )}
          </View>

          {/* CREATE ACCOUNT BUTTON */}
          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={DT.bg} size="small" />
            ) : (
              <Text style={styles.registerButtonText}>CREATE ACCOUNT →</Text>
            )}
          </TouchableOpacity>

          {/* DIVIDER */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          {/* LOGIN LINK */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* BOTTOM */}
        <View style={styles.bottomSection}>
          <Text style={styles.termsText}>
            By creating an account, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DT.bg },
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
  logoText: { fontSize: 32 },
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
  inputContainer: { marginBottom: 20 },
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
  inputIcon: { fontSize: 16, marginRight: 12 },
  input: {
    flex: 1,
    color: DT.text,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 0,
  },
  eyeButton: { padding: 4 },
  eyeIcon: { fontSize: 16 },
  matchText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 4,
  },

  // PASSWORD STRENGTH
  passwordStrength: {
    backgroundColor: DT.cardAlt,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: DT.border,
  },
  strengthTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: DT.textSec,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  requirementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DT.textTert,
  },
  requirementDotMet: { backgroundColor: DT.lime },
  requirementText: {
    fontSize: 12,
    color: DT.textTert,
    fontWeight: '500',
  },
  requirementTextMet: {
    color: DT.lime,
    fontWeight: '600',
  },

  // REGISTER BUTTON
  registerButton: {
    backgroundColor: DT.lime,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  registerButtonDisabled: { opacity: 0.7 },
  registerButtonText: {
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
  divider: { flex: 1, height: 1, backgroundColor: DT.border },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: DT.textTert,
    marginHorizontal: 16,
    letterSpacing: 1,
  },

  // LOGIN LINK
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: { fontSize: 14, fontWeight: '500', color: DT.textSec },
  loginLink: { fontSize: 14, fontWeight: '700', color: DT.lime },

  // BOTTOM
  bottomSection: { marginTop: 32, alignItems: 'center' },
  termsText: {
    fontSize: 12,
    fontWeight: '500',
    color: DT.textTert,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: { color: DT.textSec, fontWeight: '600' },
});