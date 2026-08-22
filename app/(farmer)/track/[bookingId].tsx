import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKisanOpsStore } from '../../../src/store/kisanOpsStore';
import { t } from '../../../i18n/translations';
import { Navigation, Phone, Calendar, Star, ChevronLeft, MapPin } from 'lucide-react-native';

export default function TrackBookingScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams();
  const { state } = useKisanOpsStore();
  const { bookings, currentTelemetry, machines } = state;

  const [simulatedEta, setSimulatedEta] = useState(18);

  const booking = bookings.find((b) => b.id === bookingId);
  const machine = booking ? machines.find(m => m.id === booking.machineId) : null;
  const telemetry = booking ? currentTelemetry[booking.machineId] : null;

  useEffect(() => {
    // Keep decrementing ETA slowly for visual realism
    const interval = setInterval(() => {
      setSimulatedEta((prev) => (prev > 1 ? prev - 1 : 1));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No Booking Session Found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get active status index for timeline progress
  const statusStages = ['CONFIRMED', 'DISPATCHED', 'IN_PROGRESS', 'COMPLETED'];
  const currentStageIdx = statusStages.indexOf(booking.status || 'CONFIRMED');

  const getTimelineStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return t('bookings.timelineConfirm');
      case 'DISPATCHED': return t('bookings.timelineDispatched');
      case 'IN_PROGRESS': return t('bookings.timelineStarted');
      case 'COMPLETED': return t('bookings.timelineCompleted');
      default: return status;
    }
  };

  // Determine current coordinates
  const lat = telemetry?.latitude || machine?.latitude || 23.1872;
  const lon = telemetry?.longitude || machine?.longitude || 77.1008;

  return (
    <View style={styles.container}>
      {/* Visual Header */}
      <View style={styles.etaHeader}>
        <Text style={styles.etaTitle}>
          {booking.status === 'IN_PROGRESS' 
            ? '⚡ Work is active on field boundary' 
            : `🚜 Machine arriving in ${simulatedEta} minutes`}
        </Text>
        <Text style={styles.etaSub}>
          {booking.machineModel} • GPS Coordinates: {lat.toFixed(4)}, {lon.toFixed(4)}
        </Text>
      </View>

      {/* Map Segment (Render custom high-fidelity vector representation for resilience) */}
      <View style={styles.mapMock}>
        <View style={styles.mapCard}>
          <Text style={styles.mapPlaceholderIcon}>🗺️</Text>
          <Text style={styles.mapPlaceholderText}>
            Telematics Streaming: {telemetry ? 'ACTIVE 📡' : 'MOCK PREVIEW 🛰️'}
          </Text>
          <Text style={styles.mapCoordinates}>
            Lat: {lat.toFixed(5)} • Lon: {lon.toFixed(5)}
          </Text>
          <View style={styles.pulsingMarker}>
            <View style={styles.pulseInner} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea}>
        {/* Operator Profile Card */}
        <View style={styles.card}>
          <View style={styles.operatorHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>👨‍✈️</Text>
            </View>
            <View style={styles.operatorInfo}>
              <Text style={styles.operatorLabel}>{t('bookings.operator')}</Text>
              <Text style={styles.operatorName}>{booking.operatorName || 'Raju Verma'}</Text>
              <View style={styles.ratingRow}>
                <Star color="#e6a100" fill="#e6a100" size={13} />
                <Text style={styles.ratingText}>4.9 (CHC Sehore)</Text>
              </View>
            </View>
            {booking.operatorPhone && (
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => Linking.openURL(`tel:${booking.operatorPhone}`)}
              >
                <Phone color="#ffffff" size={18} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Telematics status list */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('bookings.timelineTitle')}</Text>
          
          <View style={styles.timeline}>
            {statusStages.map((stage, idx) => {
              const isActive = idx <= currentStageIdx;
              const isCurrent = idx === currentStageIdx;

              return (
                <View key={stage} style={styles.timelineItem}>
                  <View style={styles.timelineIndicator}>
                    <View style={[styles.timelineLine, idx === 0 && { top: '50%' }, idx === statusStages.length - 1 && { bottom: '50%' }, isActive && styles.lineActive]} />
                    <View style={[styles.timelineNode, isActive && styles.nodeActive, isCurrent && styles.nodeCurrent]} />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineLabel, isActive && styles.textActive, isCurrent && styles.textCurrent]}>
                      {getTimelineStatusText(stage)}
                    </Text>
                    {isCurrent && (
                      <Text style={styles.timelineDesc}>
                        Current active stage parsed from telemetry bounds.
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F8F3', // Warm off-white
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#c62828',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: '#1b4d3e',
    paddingHorizontal: 20,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  etaHeader: {
    backgroundColor: '#1b4d3e',
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  etaTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  etaSub: {
    color: '#a3cfbb',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  mapMock: {
    height: 200,
    margin: 16,
    backgroundColor: '#e2f0d9',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#b8dbcb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapCard: {
    alignItems: 'center',
  },
  mapPlaceholderIcon: {
    fontSize: 32,
  },
  mapPlaceholderText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1b4d3e',
    marginTop: 4,
  },
  mapCoordinates: {
    fontSize: 11,
    color: '#2e7d66',
    fontWeight: '700',
    marginTop: 2,
  },
  pulsingMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1b4d3e',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  pulseInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffd700',
  },
  scrollArea: {
    paddingHorizontal: 16,
    paddingBottom: 40,
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
  operatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  operatorInfo: {
    flex: 1,
  },
  operatorLabel: {
    fontSize: 11,
    color: '#718096',
    fontWeight: 'bold',
  },
  operatorName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#1b4d3e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 16,
    minHeight: 60,
  },
  timelineIndicator: {
    alignItems: 'center',
    width: 20,
  },
  timelineLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#cbd5e0',
  },
  lineActive: {
    backgroundColor: '#1b4d3e',
  },
  timelineNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#cbd5e0',
    marginTop: 6,
    zIndex: 1,
  },
  nodeActive: {
    backgroundColor: '#1b4d3e',
  },
  nodeCurrent: {
    borderWidth: 3,
    borderColor: '#ffd700',
    backgroundColor: '#1b4d3e',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineLabel: {
    fontSize: 13,
    color: '#718096',
    fontWeight: 'bold',
  },
  timelineDesc: {
    fontSize: 11,
    color: '#1b4d3e',
    fontWeight: '600',
    marginTop: 2,
  },
  textActive: {
    color: '#2d3748',
  },
  textCurrent: {
    color: '#1b4d3e',
  },
});
