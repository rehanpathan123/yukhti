import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useKisanOpsStore } from '../../src/store/kisanOpsStore';
import { t } from '../../i18n/translations';
import { Sprout, Locate, HelpCircle } from 'lucide-react-native';
import * as Location from 'expo-location';

export default function OnboardingScreen() {
  const router = useRouter();
  const { updateFarm } = useKisanOpsStore();
  const [step, setStep] = useState(1);
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [sizeAcres, setSizeAcres] = useState('5.0');
  const [cropName, setCropName] = useState('Wheat');
  const [loadingGps, setLoadingGps] = useState(false);

  const handleGetCurrentLocation = async () => {
    setLoadingGps(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied. Please write district.');
        setLoadingGps(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      // Mock reverse geocode or fallback for Indian farm hubs
      setDistrict('Sehore');
      setVillage('Bilkisganj');
    } catch (e) {
      // Default fallback
      setDistrict('Sehore');
      setVillage('Bilkisganj');
    } finally {
      setLoadingGps(false);
    }
  };

  const handleSaveFarmProfile = () => {
    const acresNum = parseFloat(sizeAcres) || 5.0;
    updateFarm({
      farmName: 'My Farmland',
      sizeAcres: acresNum,
      state: 'Madhya Pradesh',
      district: district || 'Sehore',
      village: village || 'Bilkisganj',
      latitude: 23.1872,
      longitude: 77.1008,
      soilType: 'Medium Black Clayey Loam',
      irrigationType: 'Canal',
      crop: {
        id: `crop-${Date.now()}`,
        cropName: cropName || 'Wheat',
        season: 'Rabi',
        cropStage: 'Pre-harvest',
      },
    });
  };

  const handleDemoPreset = () => {
    setDistrict('Sehore');
    setVillage('Bilkisganj');
    setSizeAcres('8.0');
    setCropName('Wheat');
    setStep(2);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Stepper Header */}
      <View style={styles.header}>
        <Text style={styles.stepIndicator}>Step {step} of 2</Text>
        <Text style={styles.title}>{t('profile.title')}</Text>
      </View>

      {step === 1 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Where is your field? (खेत कहाँ है?)</Text>
          <Text style={styles.cardDesc}>
            Location helps find available harvesters and tractors nearest to your farm boundary.
          </Text>

          <Text style={styles.label}>{t('common.district')}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Sehore, Bhopal"
            value={district}
            onChangeText={setDistrict}
          />

          <Text style={styles.label}>{t('common.village')}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Bilkisganj"
            value={village}
            onChangeText={setVillage}
          />

          <TouchableOpacity style={styles.gpsBtn} onPress={handleGetCurrentLocation} disabled={loadingGps}>
            <Locate color="#1b4d3e" size={20} />
            <Text style={styles.gpsBtnText}>
              {loadingGps ? 'Locating...' : '📍 Auto-detect GPS Location'}
            </Text>
          </TouchableOpacity>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnSecondary} onPress={handleDemoPreset}>
              <Text style={styles.btnSecondaryText}>Use Sehore Demo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.btnPrimary, !district && styles.btnDisabled]} 
              onPress={() => setStep(2)}
              disabled={!district}
            >
              <Text style={styles.btnPrimaryText}>{t('common.next')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌾 Crop Details (फसल की जानकारी)</Text>
          <Text style={styles.cardDesc}>
            Acreage and crop type help our match recommendations select correct machine horsepower.
          </Text>

          <Text style={styles.label}>{t('common.size')}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 5.0"
            keyboardType="numeric"
            value={sizeAcres}
            onChangeText={setSizeAcres}
          />

          <Text style={styles.label}>{t('common.crop')}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Wheat, Soybean"
            value={cropName}
            onChangeText={setCropName}
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => setStep(1)}>
              <Text style={styles.btnSecondaryText}>{t('common.back')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleSaveFarmProfile}>
              <Sprout color="#ffffff" size={18} />
              <Text style={styles.btnPrimaryText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Floating Help Banner */}
      <View style={styles.helpBox}>
        <HelpCircle color="#4a5568" size={18} />
        <Text style={styles.helpText}>Need help? Swipe or tap any button to speak to Saathi.</Text>
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
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  stepIndicator: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#e69b00',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1b4d3e',
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
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: '#718096',
    lineHeight: 18,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    height: 50,
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 12,
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#1b4d3e',
    borderRadius: 14,
    height: 50,
    marginTop: 10,
    backgroundColor: '#eaf4ee',
  },
  gpsBtnText: {
    color: '#1b4d3e',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24,
  },
  btnSecondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  btnSecondaryText: {
    color: '#4a5568',
    fontWeight: 'bold',
    fontSize: 14,
  },
  btnPrimary: {
    flex: 1.2,
    backgroundColor: '#1b4d3e',
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  btnDisabled: {
    backgroundColor: '#a3bfa8',
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  helpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    paddingHorizontal: 16,
  },
  helpText: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
  },
});
