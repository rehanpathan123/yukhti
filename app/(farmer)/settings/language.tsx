import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { setLanguage, getLanguage } from '../../../i18n/translations';
import { ChevronLeft } from 'lucide-react-native';

export default function LanguageSettingsScreen() {
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState(getLanguage());

  const handleSelectLang = (lang: 'en' | 'hi') => {
    setLanguage(lang);
    setCurrentLang(lang);
    router.back();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <ChevronLeft color="#1b4d3e" size={24} />
        <Text style={styles.backBtnText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>App Language / भाषा चुनें</Text>

      <TouchableOpacity
        style={[styles.langOption, currentLang === 'hi' && styles.langOptionActive]}
        onPress={() => handleSelectLang('hi')}
      >
        <Text style={[styles.langText, currentLang === 'hi' && styles.langTextActive]}>हिन्दी (Hindi)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.langOption, currentLang === 'en' && styles.langOptionActive]}
        onPress={() => handleSelectLang('en')}
      >
        <Text style={[styles.langText, currentLang === 'en' && styles.langTextActive]}>English (अंग्रेजी)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F8F3', // Warm off-white
    padding: 24,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 32,
    marginTop: 10,
  },
  backBtnText: {
    color: '#1b4d3e',
    fontWeight: 'bold',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1b4d3e',
    marginBottom: 24,
  },
  langOption: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#cbd5e0',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  langOptionActive: {
    borderColor: '#1b4d3e',
    backgroundColor: '#eaf4ee',
  },
  langText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  langTextActive: {
    color: '#1b4d3e',
  },
});
