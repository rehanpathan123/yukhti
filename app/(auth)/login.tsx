import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useKisanOpsStore } from '../../src/store/kisanOpsStore';
import { t, setLanguage, getLanguage } from '../../i18n/translations';
import { SEEDED_PROFILES } from '../../src/data/seedData';
import { Sparkles, Phone, ShieldCheck, Building2, Tractor, User, CheckCircle2 } from 'lucide-react-native';
import { UserRole } from '../../src/types';

export default function LoginScreen() {
  const router = useRouter();
  const { loginUser } = useKisanOpsStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>('FARMER');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpMode, setOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [currentLang, setCurrentLang] = useState(getLanguage());

  const handleLanguageToggle = (lang: 'en' | 'hi') => {
    setLanguage(lang);
    setCurrentLang(lang);
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    // Suggest corresponding demo phone number
    const demo = SEEDED_PROFILES.find(p => p.role === role);
    if (demo) {
      setPhoneNumber(demo.phoneNumber.replace('+91 ', ''));
    }
  };

  const handleRequestOtp = () => {
    if (phoneNumber.length >= 10) {
      setOtpMode(true);
    }
  };

  const handleVerifyOtp = () => {
    const cleanEntered = phoneNumber.replace(/[\s-+]/g, '');
    const matchedProfile = SEEDED_PROFILES.find(p => 
      p.role === selectedRole && p.phoneNumber.replace(/[\s-+]/g, '').includes(cleanEntered)
    ) || SEEDED_PROFILES.find(p => 
      p.phoneNumber.replace(/[\s-+]/g, '').includes(cleanEntered)
    ) || {
      id: `user-${selectedRole.toLowerCase()}-${Date.now()}`,
      fullName: selectedRole === 'FARMER' 
        ? `Farmer #${cleanEntered.slice(-4)}`
        : selectedRole === 'CHC_MANAGER'
        ? `CHC Manager #${cleanEntered.slice(-4)}`
        : `Operator #${cleanEntered.slice(-4)}`,
      phoneNumber: `+91 ${cleanEntered}`,
      role: selectedRole,
      district: 'Sehore',
      village: 'Bilkisganj',
    };
    
    loginUser(matchedProfile);
  };

  const handleFastDemoLogin = (role: UserRole) => {
    const profile = SEEDED_PROFILES.find(p => p.role === role) || SEEDED_PROFILES[0];
    loginUser(profile);
  };

  const ramesh = SEEDED_PROFILES.find(p => p.role === 'FARMER') || SEEDED_PROFILES[0];
  const rajesh = SEEDED_PROFILES.find(p => p.role === 'CHC_MANAGER') || SEEDED_PROFILES[1];
  const raju = SEEDED_PROFILES.find(p => p.role === 'OPERATOR') || SEEDED_PROFILES[2];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.responsiveWrapper}>
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
          <Text style={styles.subtitle}>
            {currentLang === 'hi'
              ? 'किसान, सीएचसी हब और ऑपरेटर प्लेटफॉर्म'
              : 'Agri Machinery Rental & Telematics Platform'}
          </Text>
        </View>

        {/* Role Selector Tabs */}
        <View style={styles.roleTabsContainer}>
          <TouchableOpacity
            style={[styles.roleTab, selectedRole === 'FARMER' && styles.roleTabActive]}
            onPress={() => handleRoleSelect('FARMER')}
          >
            <User size={18} color={selectedRole === 'FARMER' ? '#ffffff' : '#1b4d3e'} />
            <Text style={[styles.roleTabText, selectedRole === 'FARMER' && styles.roleTabTextActive]}>
              {currentLang === 'hi' ? 'किसान' : 'Farmer'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleTab, selectedRole === 'CHC_MANAGER' && styles.roleTabActive]}
            onPress={() => handleRoleSelect('CHC_MANAGER')}
          >
            <Building2 size={18} color={selectedRole === 'CHC_MANAGER' ? '#ffffff' : '#1b4d3e'} />
            <Text style={[styles.roleTabText, selectedRole === 'CHC_MANAGER' && styles.roleTabTextActive]}>
              {currentLang === 'hi' ? 'सीएचसी हब' : 'CHC Hub'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleTab, selectedRole === 'OPERATOR' && styles.roleTabActive]}
            onPress={() => handleRoleSelect('OPERATOR')}
          >
            <Tractor size={18} color={selectedRole === 'OPERATOR' ? '#ffffff' : '#1b4d3e'} />
            <Text style={[styles.roleTabText, selectedRole === 'OPERATOR' && styles.roleTabTextActive]}>
              {currentLang === 'hi' ? 'ऑपरेटर' : 'Operator'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Phone/OTP Login Form */}
        <View style={styles.card}>
          <View style={styles.roleBadge}>
            <CheckCircle2 size={14} color="#1b4d3e" />
            <Text style={styles.roleBadgeText}>
              {selectedRole === 'FARMER'
                ? (currentLang === 'hi' ? 'किसान लॉगिन' : 'Farmer Login')
                : selectedRole === 'CHC_MANAGER'
                ? (currentLang === 'hi' ? 'सीएचसी हब प्रबंधक लॉगिन' : 'CHC Hub Manager Login')
                : (currentLang === 'hi' ? 'मशीन ऑपरेटर / चालक लॉगिन' : 'Machinery Operator Login')}
            </Text>
          </View>

          {!otpMode ? (
            <View>
              <Text style={styles.inputLabel}>{t('common.phone')}</Text>
              <View style={styles.inputContainer}>
                <Phone color="#718096" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={
                    selectedRole === 'FARMER'
                      ? '98260 41234'
                      : selectedRole === 'CHC_MANAGER'
                      ? '94250 88912'
                      : '97550 12399'
                  }
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
                  placeholder="1234"
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

        {/* 1-Tap Fast-Track Demo Logins */}
        <View style={styles.demoBlock}>
          <View style={styles.demoHeader}>
            <Sparkles color="#ffd700" size={20} />
            <Text style={styles.demoTitle}>
              {currentLang === 'hi' ? 'त्वरित डेमो लॉगिन (1-टैप)' : '1-Tap Fast Demo Logins'}
            </Text>
          </View>

          {/* 1. Farmer Login */}
          <TouchableOpacity 
            style={[styles.demoCard, selectedRole === 'FARMER' && styles.demoCardHighlighted]} 
            onPress={() => handleFastDemoLogin('FARMER')}
          >
            <View style={styles.demoCardIcon}>
              <User color="#1b4d3e" size={20} />
            </View>
            <View style={styles.demoCardContent}>
              <Text style={styles.demoCardRole}>
                {currentLang === 'hi' ? '🌾 किसान: ' : '🌾 Farmer: '}
                <Text style={styles.demoCardName}>{ramesh.fullName}</Text>
              </Text>
              <Text style={styles.demoCardSub}>
                {currentLang === 'hi' ? '8-एकड़ गेहूं खेत • बिलकिसगंज, सीहोर' : '8-Acre Wheat Farm • Bilkisganj, Sehore'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* 2. CHC Manager Login */}
          <TouchableOpacity 
            style={[styles.demoCard, selectedRole === 'CHC_MANAGER' && styles.demoCardHighlighted]} 
            onPress={() => handleFastDemoLogin('CHC_MANAGER')}
          >
            <View style={[styles.demoCardIcon, { backgroundColor: '#e0f2fe' }]}>
              <Building2 color="#0369a1" size={20} />
            </View>
            <View style={styles.demoCardContent}>
              <Text style={styles.demoCardRole}>
                {currentLang === 'hi' ? '🏢 सीएचसी केंद्र प्रबंधक: ' : '🏢 CHC Hub Manager: '}
                <Text style={styles.demoCardName}>{rajesh.fullName}</Text>
              </Text>
              <Text style={styles.demoCardSub}>
                {currentLang === 'hi' ? 'सीहोर एग्री सेंटर #01 • 14 मशीनें बेड़ा' : 'Sehore Agri Centre #01 • 14 Machine Fleet'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* 3. Operator Login */}
          <TouchableOpacity 
            style={[styles.demoCard, selectedRole === 'OPERATOR' && styles.demoCardHighlighted]} 
            onPress={() => handleFastDemoLogin('OPERATOR')}
          >
            <View style={[styles.demoCardIcon, { backgroundColor: '#fef3c7' }]}>
              <Tractor color="#b45309" size={20} />
            </View>
            <View style={styles.demoCardContent}>
              <Text style={styles.demoCardRole}>
                {currentLang === 'hi' ? '🚜 मशीन ऑपरेटर: ' : '🚜 Machine Operator: '}
                <Text style={styles.demoCardName}>{raju.fullName}</Text>
              </Text>
              <Text style={styles.demoCardSub}>
                {currentLang === 'hi' ? 'जॉन डियर हार्वेस्टर व ट्रैक्टर चालक' : 'John Deere Harvester & Tractor Pilot'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F9F8F3', // Warm off-white
    padding: 20,
    justifyContent: 'center',
  },
  responsiveWrapper: {
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
  },
  langContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    backgroundColor: '#e2e8f0',
    borderRadius: 20,
    padding: 3,
    marginBottom: 24,
  },
  langBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
  },
  langBtnActive: {
    backgroundColor: '#1b4d3e',
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
    marginBottom: 24,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#e6f4ea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#a3cfbb',
  },
  logoLetter: {
    fontSize: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1b4d3e',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#4a5568',
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  roleTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#e6ede8',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  roleTabActive: {
    backgroundColor: '#1b4d3e',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  roleTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1b4d3e',
  },
  roleTabTextActive: {
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#1a202c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: 20,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 16,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1b4d3e',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 50,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1a202c',
    fontWeight: '600',
  },
  btn: {
    backgroundColor: '#1b4d3e',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  btnDisabled: {
    backgroundColor: '#a3bfa8',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  backBtn: {
    marginTop: 12,
    alignItems: 'center',
  },
  backText: {
    color: '#1b4d3e',
    fontWeight: 'bold',
    fontSize: 13,
  },
  demoBlock: {
    backgroundColor: '#1b4d3e',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#225d4b',
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  demoCardHighlighted: {
    borderWidth: 2,
    borderColor: '#ffd700',
    backgroundColor: '#ffffff',
  },
  demoCardIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#e6f4ea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoCardContent: {
    flex: 1,
  },
  demoCardRole: {
    fontSize: 13,
    color: '#1a202c',
    fontWeight: '600',
  },
  demoCardName: {
    fontWeight: '800',
    color: '#1b4d3e',
  },
  demoCardSub: {
    fontSize: 11,
    color: '#718096',
    marginTop: 2,
  },
});
