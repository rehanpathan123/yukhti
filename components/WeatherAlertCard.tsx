import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { CloudRain, Sun, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react-native';
import { fetchAgroWeatherForecast, resolveCoordinatesForDistrict, HarvestRiskAssessment } from '../src/lib/weatherEngine';
import { t } from '../i18n/translations';

interface WeatherAlertCardProps {
  district?: string;
  latitude?: number;
  longitude?: number;
}

export function WeatherAlertCard({ district = 'Sehore', latitude, longitude }: WeatherAlertCardProps) {
  const [loading, setLoading] = useState(true);
  const [temp, setTemp] = useState(31);
  const [assessment, setAssessment] = useState<HarvestRiskAssessment | null>(null);

  useEffect(() => {
    async function loadWeatherData() {
      setLoading(true);
      try {
        const coords = await resolveCoordinatesForDistrict(
          district,
          latitude && longitude ? { latitude, longitude } : undefined
        );
        const res = await fetchAgroWeatherForecast(coords);
        setTemp(Math.round(res.currentTemp));
        setAssessment(res.assessment);
      } catch (e) {
        console.warn('Failed to load agro weather data:', e);
        setAssessment({
          overallRiskLevel: 'LOW',
          viabilityScore: 100,
          dryWindowHoursRemaining: 72,
          nextRainExpectedInHours: null,
          totalIncomingRainfallMm: 0,
          soilTraction: {
            moisturePercent: 10,
            status: 'OPTIMAL_TRACTION',
            maxAllowedMachineWeightTons: 15,
            recommendation: 'मशीन चलाने के लिए खेत की स्थिति अच्छी है।',
          },
          weatherDemandSurgeFactor: 1.0,
          alertTitle: 'Clear Weather',
          alertSummary: 'मशीन चलाने के लिए खेत की स्थिति अच्छी है।',
          actionRecommendation: 'OPTIMAL',
        });
      } finally {
        setLoading(false);
      }
    }

    loadWeatherData();
  }, [district, latitude, longitude]);

  if (loading) {
    return (
      <View style={[styles.card, styles.loadingCard]}>
        <ActivityIndicator size="small" color="#1b4d3e" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  const traction = assessment?.soilTraction?.status || 'OPTIMAL_TRACTION';
  let tractionText = '';
  let tractionColor = '';
  let tractionBg = '';
  let IconComponent = CheckCircle;

  if (traction === 'OPTIMAL_TRACTION') {
    tractionText = t('common.hindi') === 'हिन्दी' ? 'मशीन चलाने के लिए खेत की स्थिति अच्छी है।' : 'Fields dry and optimal. Machinery is safe to run.';
    tractionColor = '#2e7d32'; // Green
    tractionBg = '#e8f5e9';
    IconComponent = CheckCircle;
  } else if (traction === 'MODERATE_SLIPPAGE') {
    tractionText = t('common.hindi') === 'हिन्दी' ? 'खेत में फिसलन हो सकती है। हल्की मशीन बेहतर रहेगी।' : 'Fields slippery. Lighter equipment recommended.';
    tractionColor = '#e65100'; // Amber
    tractionBg = '#fff8e1';
    IconComponent = AlertTriangle;
  } else {
    tractionText = t('common.hindi') === 'हिन्दी' ? 'खेत बहुत गीला है। भारी मशीन चलाने से नुकसान हो सकता है।' : 'Fields wet and muddy. IMPASSABLE for heavy machinery.';
    tractionColor = '#c62828'; // Red
    tractionBg = '#ffebee';
    IconComponent = AlertTriangle;
  }

  return (
    <View style={[styles.card, { borderColor: tractionColor }]}>
      <View style={styles.topRow}>
        <View style={styles.weatherInfo}>
          <Text style={styles.location}>📍 {district}</Text>
          <Text style={styles.temp}>☀️ {temp}°C</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: tractionBg }]}>
          <IconComponent color={tractionColor} size={16} />
          <Text style={[styles.badgeText, { color: tractionColor }]}>{traction}</Text>
        </View>
      </View>

      <View style={styles.warningContainer}>
        <Text style={[styles.warningText, { color: tractionColor }]}>
          {tractionText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#1a202c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginVertical: 8,
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderColor: '#e2e8f0',
  },
  loadingText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: 'bold',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  location: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  temp: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  warningContainer: {
    marginTop: 4,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
});
