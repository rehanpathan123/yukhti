import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useKisanOpsStore } from '../../src/store/kisanOpsStore';
import { t, setLanguage, getLanguage } from '../../i18n/translations';
import { WeatherAlertCard } from '../../components/WeatherAlertCard';
import { Mic, Tractor, Sparkles, AlertCircle } from 'lucide-react-native';
import { scoreMachineForFarmer } from '../../src/lib/recommendationEngine';
import { calculateDynamicPrice } from '../../src/lib/pricingEngine';

export default function FarmerHomeScreen() {
  const router = useRouter();
  const { state } = useKisanOpsStore();
  const [currentLang, setCurrentLang] = useState(getLanguage());

  const { farm, machines, bookings, currentUser } = state;
  const isFarmConfigured = farm?.sizeAcres > 0 && !!farm?.district;

  // Filter bookings to find active rentals
  const activeBooking = bookings.find(
    (b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && b.status !== 'DISPUTED'
  );

  // Toggle Language
  const handleToggleLang = () => {
    const nextLang = currentLang === 'hi' ? 'en' : 'hi';
    setLanguage(nextLang);
    setCurrentLang(nextLang);
  };

  // Find top recommended machine
  let topMatch: any = null;
  if (isFarmConfigured && machines.length > 0) {
    const scored = machines.map(m => {
      const match = scoreMachineForFarmer(m, { farm, activity: 'HARVESTING' });
      const price = calculateDynamicPrice(m, {
        demandIndex: 94,
        shortageUnits: 2,
        distanceKm: m.distanceKm || 3.2
      });
      return { machine: m, score: match.matchScore, reasons: match.reasons, priceQuote: price };
    }).sort((a, b) => b.score - a.score);
    topMatch = scored[0];
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Minimalism Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {t('home.greeting', { name: currentUser?.fullName || 'Ramesh' })}
          </Text>
          <Text style={styles.villageSub}>
            📍 {isFarmConfigured ? `${farm.village}, ${farm.district}` : 'खेत दर्ज करें'}
          </Text>
        </View>
        <TouchableOpacity style={styles.langBadge} onPress={handleToggleLang}>
          <Text style={styles.langText}>
            {currentLang === 'hi' ? 'English' : 'हिन्दी'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Simplified Agro-Weather Widget */}
      {isFarmConfigured ? (
        <WeatherAlertCard district={farm.district} latitude={farm.latitude} longitude={farm.longitude} />
      ) : (
        <TouchableOpacity style={styles.setupWarning} onPress={() => router.push('/(auth)/onboarding')}>
          <AlertCircle color="#b78103" size={20} />
          <Text style={styles.setupWarningText}>खेत की जानकारी दर्ज करने के लिए यहां छुएं</Text>
        </TouchableOpacity>
      )}

      {/* Giant Minimalistic Voice Cockpit */}
      <View style={styles.voiceSection}>
        <Text style={styles.voiceTitle}>{t('common.saathiName')}</Text>
        <Text style={styles.voiceDesc}>{t('saathi.tagline')}</Text>
        
        <TouchableOpacity
          style={styles.micCircle}
          onPress={() => router.push('/(farmer)/assistant')}
          activeOpacity={0.8}
        >
          <Mic color="#ffffff" size={38} />
        </TouchableOpacity>
        
        <Text style={styles.micHint}>{t('home.speak')}</Text>
      </View>

      {/* Active Tracking Banner (Only shows when booking is live) */}
      {activeBooking && (
        <TouchableOpacity
          style={styles.activeBanner}
          onPress={() => router.push({
            pathname: '/(farmer)/track/[bookingId]',
            params: { bookingId: activeBooking.id }
          })}
        >
          <View style={styles.activeTextRow}>
            <Text style={styles.activeLabel}>🚜 {t('home.activeBooking')}</Text>
            <Text style={styles.activeModel}>{activeBooking.machineModel}</Text>
          </View>
          <Text style={styles.activeTrackText}>{t('bookings.track')} →</Text>
        </TouchableOpacity>
      )}

      {/* Minimalistic Operations Grid */}
      <Text style={styles.sectionTitle}>⚙️ {t('home.whatDoYouNeed').split('?')[0]}</Text>
      <View style={styles.opsGrid}>
        <TouchableOpacity style={styles.opCard} onPress={() => router.push('/(farmer)/machines')}>
          <Text style={styles.opEmoji}>🌾</Text>
          <Text style={styles.opLabel}>कटाई (Harvest)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.opCard} onPress={() => router.push('/(farmer)/machines')}>
          <Text style={styles.opEmoji}>🚜</Text>
          <Text style={styles.opLabel}>जुताई (Plough)</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Access recommended machine (1-click Booking) */}
      {topMatch && (
        <TouchableOpacity
          style={styles.recommendCard}
          onPress={() => router.push({
            pathname: '/(farmer)/machines/[id]',
            params: { id: topMatch.machine.id }
          })}
        >
          <View style={styles.recommendHeader}>
            <Text style={styles.recommendTag}>⭐ {t('home.recommended')}</Text>
            <Text style={styles.recommendScore}>{topMatch.score}% Match</Text>
          </View>
          <Text style={styles.recommendName}>{topMatch.machine.brand} {topMatch.machine.model}</Text>
          <Text style={styles.recommendPrice}>₹{topMatch.priceQuote.quotedRatePerHour}/hr • बुक करने के लिए छुएं</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FDFBF7', // Ultra warm minimalistic cream
    flexGrow: 1,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1b4d3e',
  },
  villageSub: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '600',
    marginTop: 2,
  },
  langBadge: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#1b4d3e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  langText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1b4d3e',
  },
  setupWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff8e1',
    borderWidth: 1,
    borderColor: '#ffe082',
    padding: 14,
    borderRadius: 16,
    marginVertical: 6,
  },
  setupWarningText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#b78103',
  },
  voiceSection: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginVertical: 12,
    shadowColor: '#1b4d3e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  voiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b4d3e',
  },
  voiceDesc: {
    fontSize: 13,
    color: '#718096',
    marginTop: 4,
    fontWeight: '600',
  },
  micCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1b4d3e',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#1b4d3e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  micHint: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1b4d3e',
  },
  activeBanner: {
    backgroundColor: '#1b4d3e',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  activeTextRow: {
    flex: 1,
  },
  activeLabel: {
    color: '#a3cfbb',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  activeModel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 2,
  },
  activeTrackText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#2d3748',
    marginTop: 16,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  opsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  opCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  opEmoji: {
    fontSize: 28,
  },
  opLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2d3748',
    marginTop: 8,
  },
  recommendCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 20,
    padding: 16,
    marginVertical: 8,
  },
  recommendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recommendTag: {
    fontSize: 11,
    fontWeight: '900',
    color: '#b78103',
    textTransform: 'uppercase',
  },
  recommendScore: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  recommendName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  recommendPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1b4d3e',
    marginTop: 4,
  },
});
