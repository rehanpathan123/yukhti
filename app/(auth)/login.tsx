import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useKisanOpsStore } from '../../src/store/kisanOpsStore';
import { t, setLanguage, getLanguage } from '../../i18n/translations';
import { SEEDED_PROFILES } from '../../src/data/seedData';
import { Sparkles, Phone, ShieldCheck } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { loginUser } = useKisanOpsStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpMode, setOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [currentLang, setCurrentLang] = useState(getLanguage());

  const handleLanguageToggle = (lang: 'en' | 'hi') => {
    setLanguage(lang);
    setCurrentLang(lang);
  };

  const handleRequestOtp = () => {
    if (phoneNumber.length >= 10) {
      setOtpMode(true);
    }
  };

  const handleVerifyOtp = () => {
    // If the phone matches a seed demo user, load them, else create fresh
    const matchedProfile = SEEDED_PROFILES.find(p => p.phoneNumber.replace(/[\s-+]/g, '').includes(phoneNumber.replace(/[\s-+]/g, ''))) 
      || {
        id: `farmer-${Date.now()}`,
        fullName: `Farmer #${phoneNumber.slice(-4)}`,
        phoneNumber: phoneNumber,
        role: 'FARMER' as const,
        district: '',
        village: '',
      };
    
    loginUser(matchedProfile);
  };

  const handleFastDemoLogin = () => {
    // Fast login as Ramesh Kumar (Farmer, Sehore)
    const ramesh = SEEDED_PROFILES.find(p => p.role === 'FARMER') || SEEDED_PROFILES[0];
    loginUser(ramesh);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top Bar Language Toggle */}
      <View style={styles.langContainer}>
        <TouchableOpacity
          style={[styles.langBtn, currentLang === 'hi' && styles.langBtnActive]}
          onPress={() => handleLanguageToggle('hi')}
        >
          <Text style={[styles.langText, currentLang === 'hi' && styles.langTextActive]}>हिन्दी</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.langBtn, currentLang === 'en' && styles.langBtnActive]}
          onPress={() => handleLanguageToggle('en')}
        >
          <Text style={[styles.langText, currentLang === 'en' && styles.langTextActive]}>English</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Branding */}
      <View style={styles.heroBlock}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>🌾</Text>
        </View>
        <Text style={styles.title}>{t('common.appName')}</Text>
        <Text style={styles.subtitle}>{t('saathi.tagline')}</Text>
      </View>

      {/* Main Form */}
      <View style={styles.card}>
        {!otpMode ? (
          <View>
            <Text style={styles.inputLabel}>{t('common.phone')}</Text>
            <View style={styles.inputContainer}>
              <Phone color="#718096" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 98260 41234"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={15}
              />
            </View>
            <TouchableOpacity
              style={[styles.btn, phoneNumber.length < 10 && styles.btnDisabled]}
              onPress={handleRequestOtp}
              disabled={phoneNumber.length < 10}
            >
              <Text style={styles.btnText}>{t('common.next')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.inputLabel}>{t('common.otp')}</Text>
            <View style={styles.inputContainer}>
              <ShieldCheck color="#718096" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="XXXX"
                keyboardType="number-pad"
                value={otpCode}
                onChangeText={setOtpCode}
                maxLength={6}
              />
            </View>
            <TouchableOpacity
              style={styles.btn}
              onPress={handleVerifyOtp}
            >
              <Text style={styles.btnText}>{t('common.login')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setOtpMode(false)} style={styles.backBtn}>
              <Text style={styles.backText}>← {t('common.back')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Hackathon Fast-Track Button */}
      <View style={styles.demoBlock}>
        <Text style={styles.demoTitle}>🏆 Hackathon Evaluator Fast-Track</Text>
        <TouchableOpacity style={styles.demoBtn} onPress={handleFastDemoLogin}>
          <Sparkles color="#ffffff" size={18} />
          <Text style={styles.demoBtnText}>Login as Ramesh Kumar (Demo Farm)</Text>
        </TouchableOpacity>
        <Text style={styles.demoSubtitle}>Skip OTP setup & load ready-made 8-Acre wheat farm in Sehore.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F9F8F3', // Warm off-white
    padding: 24,
    justifyContent: 'center',
  },
  langContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    backgroundColor: '#e2e8f0',
    borderRadius: 20,
    padding: 3,
    marginBottom: 40,
  },
  langBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
  },
  langBtnActive: {
    backgroundColor: '#1b4d3e', // Primary green
  },
  langText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  langTextActive: {
    color: '#ffffff',
  },
  heroBlock: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#e6f4ea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#a3cfbb',
  },
  logoLetter: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1b4d3e',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#4a5568',
    marginTop: 4,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#1a202c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 16,
    paddingHorizontal: 12,
    marginBottom: 20,
    height: 54,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a202c',
    fontWeight: '600',
  },
  btn: {
    backgroundColor: '#1b4d3e',
    borderRadius: 16,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  btnDisabled: {
    backgroundColor: '#a3bfa8',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  backText: {
    color: '#1b4d3e',
    fontWeight: 'bold',
    fontSize: 14,
  },
  demoBlock: {
    backgroundColor: '#1b4d3e',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#225d4b',
  },
  demoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 10,
  },
  demoBtn: {
    flexDirection: 'row',
    backgroundColor: '#2e7d66',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  demoBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  demoSubtitle: {
    fontSize: 11,
    color: '#a3cfbb',
    textAlign: 'center',
    lineHeight: 14,
  },
});
