import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useKisanOpsStore } from '../../../src/store/kisanOpsStore';
import { t, setLanguage, getLanguage } from '../../../i18n/translations';
import { SaathiWidget } from '../../../components/SaathiWidget';
import { Sprout, User, ShieldCheck, RefreshCw, LogOut } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { state, updateFarm, clearAllData, loginUser } = useKisanOpsStore();
  const { farm, currentUser, agriCredit } = state;

  const [isEditing, setIsEditing] = useState(false);
  const [village, setVillage] = useState(farm.village || '');
  const [district, setDistrict] = useState(farm.district || '');
  const [sizeAcres, setSizeAcres] = useState(String(farm.sizeAcres || '5.0'));
  const [cropName, setCropName] = useState(farm.crop?.cropName || 'Wheat');
  const [currentLang, setCurrentLang] = useState(getLanguage());

  const handleToggleLang = (lang: 'en' | 'hi') => {
    setLanguage(lang);
    setCurrentLang(lang);
  };

  const handleSave = () => {
    updateFarm({
      village,
      district,
      sizeAcres: parseFloat(sizeAcres) || 5.0,
      crop: {
        ...farm.crop,
        cropName,
      }
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    clearAllData();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollArea}>
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>🌾</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{currentUser.fullName}</Text>
              <Text style={styles.phone}>{currentUser.phoneNumber}</Text>
            </View>
          </View>
        </View>

        {/* AgriCredit Limit Card */}
        <View style={[styles.card, { borderColor: '#e69b00', borderWidth: 1 }]}>
          <Text style={styles.creditTitle}>🛡️ {t('credit.title')}</Text>
          <View style={styles.creditSummary}>
            <View style={styles.creditItem}>
              <Text style={styles.creditLabel}>{t('credit.eligibleLimit')}</Text>
              <Text style={styles.creditValue}>₹{agriCredit.creditLimit.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.creditItem}>
              <Text style={styles.creditLabel}>{t('credit.availableLimit')}</Text>
              <Text style={[styles.creditValue, { color: '#2e7d32' }]}>
                ₹{agriCredit.availableCredit.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
          <Text style={styles.creditFoot}>{t('credit.tenure')}</Text>
        </View>

        {/* Farm & Crop Config */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🌾 {t('profile.farmTitle')}</Text>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={styles.editBtnText}>{t('common.edit')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {!isEditing ? (
            <View style={styles.farmDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('common.district')}:</Text>
                <Text style={styles.detailValue}>{farm.district || 'Not Set'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('common.village')}:</Text>
                <Text style={styles.detailValue}>{farm.village || 'Not Set'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('common.size')}:</Text>
                <Text style={styles.detailValue}>{farm.sizeAcres} Acres</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('common.crop')}:</Text>
                <Text style={styles.detailValue}>{farm.crop?.cropName || 'Not Set'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('profile.soilType')}:</Text>
                <Text style={styles.detailValue}>{farm.soilType || 'Medium Black Loam'}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.farmForm}>
              <Text style={styles.inputLabel}>{t('common.district')}</Text>
              <TextInput style={styles.input} value={district} onChangeText={setDistrict} />

              <Text style={styles.inputLabel}>{t('common.village')}</Text>
              <TextInput style={styles.input} value={village} onChangeText={setVillage} />

              <Text style={styles.inputLabel}>{t('common.size')}</Text>
              <TextInput style={styles.input} value={sizeAcres} onChangeText={setSizeAcres} keyboardType="numeric" />

              <Text style={styles.inputLabel}>{t('common.crop')}</Text>
              <TextInput style={styles.input} value={cropName} onChangeText={setCropName} />

              <View style={styles.formActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
                  <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>{t('common.save')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Language Selection Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🌐 App Language / भाषा</Text>
          <View style={styles.langSelector}>
            <TouchableOpacity
              style={[styles.langBtn, currentLang === 'hi' && styles.langBtnActive]}
              onPress={() => handleToggleLang('hi')}
            >
              <Text style={[styles.langText, currentLang === 'hi' && styles.langTextActive]}>हिन्दी (Hindi)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langBtn, currentLang === 'en' && styles.langBtnActive]}
              onPress={() => handleToggleLang('en')}
            >
              <Text style={[styles.langText, currentLang === 'en' && styles.langTextActive]}>English (अंग्रेजी)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* System Administration Shortcuts */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut color="#c62828" size={18} />
          <Text style={styles.logoutText}>{t('common.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <SaathiWidget />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F8F3', // Warm off-white
  },
  scrollArea: {
    padding: 16,
    paddingBottom: 80,
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    marginBottom: 14,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#eaf4ee',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e0',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  phone: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '600',
    marginTop: 2,
  },
  creditTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#e69b00',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  creditSummary: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  creditItem: {
    flex: 1,
  },
  creditLabel: {
    fontSize: 11,
    color: '#718096',
    fontWeight: 'bold',
  },
  creditValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2d3748',
    marginTop: 2,
  },
  creditFoot: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '600',
    borderTopWidth: 1,
    borderTopColor: '#f7fafc',
    paddingTop: 8,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  editBtnText: {
    color: '#1b4d3e',
    fontWeight: 'bold',
    fontSize: 13,
  },
  farmDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
    color: '#718096',
    fontWeight: 'bold',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  farmForm: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4a5568',
    marginTop: 4,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 10,
    backgroundColor: '#f7fafc',
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#1a202c',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#cbd5e0',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#718096',
    fontWeight: 'bold',
  },
  saveBtn: {
    backgroundColor: '#1b4d3e',
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  langSelector: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  langBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
  },
  langBtnActive: {
    backgroundColor: '#eaf4ee',
    borderColor: '#1b4d3e',
  },
  langText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  langTextActive: {
    color: '#1b4d3e',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fed7d7',
    height: 48,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 30,
  },
  logoutText: {
    color: '#c62828',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
