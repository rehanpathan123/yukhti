import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useKisanOpsStore } from '../../src/store/kisanOpsStore';
import { 
  Tractor, 
  MapPin, 
  Phone, 
  Play, 
  Pause, 
  CheckCircle2, 
  Navigation, 
  Flame, 
  Gauge, 
  Radio,
  Clock,
  Fuel
} from 'lucide-react-native';

export default function OperatorCockpitScreen() {
  const { state, updateBookingStatus } = useKisanOpsStore();
  const [jobState, setJobState] = useState<'IDLE' | 'IN_TRANSIT' | 'WORKING' | 'PAUSED'>('WORKING');
  const [fuelAdded, setFuelAdded] = useState(0);

  // Active or first dispatched booking
  const activeBooking = state.bookings.find(
    b => b.status === 'DISPATCHED' || b.status === 'IN_PROGRESS'
  ) || state.bookings[0];

  const targetMachine = state.machines.find(
    m => m.id === activeBooking?.machineId
  ) || state.machines[0];

  const telemetry = state.currentTelemetry[targetMachine?.id || 'mach-jd-harv-07'] || {
    fuelLevelLitres: 78,
    engineHours: 412.8,
    speedKmph: 4.8,
    coolantTempCelsius: 86,
    engineRpm: 1950,
  };

  const handleStartWork = () => {
    setJobState('WORKING');
    if (activeBooking) {
      updateBookingStatus(activeBooking.id, 'IN_PROGRESS');
      Alert.alert('Telemetry Active', 'Field telemetry logging engaged. GPS beacon broadcasting to farmer & CHC.');
    }
  };

  const handlePauseWork = () => {
    setJobState('PAUSED');
    Alert.alert('Work Paused', 'Engine idle timer engaged. Field work paused.');
  };

  const handleCompleteJob = () => {
    if (activeBooking) {
      updateBookingStatus(activeBooking.id, 'COMPLETED');
      setJobState('IDLE');
      Alert.alert('Job Completed! 🎉', `Telemetry log finalized: ${activeBooking.bookedHours} engine hrs recorded. Final invoice generated for ${activeBooking.farmerName}.`);
    }
  };

  const handleAddFuel = () => {
    setFuelAdded(prev => prev + 20);
    Alert.alert('Fuel Logged', '+20 Litres high-speed diesel logged for this job route.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.responsiveWrapper}>
        {/* Pilot Header Card */}
        <View style={styles.pilotHeaderCard}>
          <View style={styles.pilotRow}>
            <View style={styles.pilotAvatar}>
              <Text style={styles.pilotInitial}>RV</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pilotName}>Raju Verma (Operator)</Text>
              <Text style={styles.pilotRole}>Assigned: {targetMachine?.brand} {targetMachine?.model} ({targetMachine?.identifier})</Text>
            </View>
            <View style={styles.statusPill}>
              <Radio color="#10b981" size={12} />
              <Text style={styles.statusPillText}>{jobState}</Text>
            </View>
          </View>
        </View>

        {/* Current Active Job Order */}
        {activeBooking && (
          <View style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <View>
                <Text style={styles.jobBadge}>Current Field Assignment</Text>
                <Text style={styles.farmerName}>{activeBooking.farmerName}</Text>
              </View>
              <View style={styles.rateBadge}>
                <Text style={styles.rateText}>₹{activeBooking.hourlyRate}/hr</Text>
              </View>
            </View>

            <View style={styles.jobInfoBox}>
              <View style={styles.jobInfoRow}>
                <MapPin color="#1b4d3e" size={16} />
                <Text style={styles.jobLocationText}>{activeBooking.farmLocation}</Text>
              </View>
              <View style={styles.jobInfoRow}>
                <Phone color="#1b4d3e" size={16} />
                <Text style={styles.jobPhoneText}>{activeBooking.farmerPhone}</Text>
              </View>
              <View style={styles.jobInfoRow}>
                <Clock color="#1b4d3e" size={16} />
                <Text style={styles.jobHoursText}>{activeBooking.bookedHours} Hours Booked ({activeBooking.activity || 'HARVESTING'})</Text>
              </View>
            </View>

            {/* Operator Job Controls */}
            <View style={styles.controlsRow}>
              {jobState === 'WORKING' ? (
                <TouchableOpacity style={[styles.controlBtn, { backgroundColor: '#d97706' }]} onPress={handlePauseWork}>
                  <Pause size={18} color="#ffffff" />
                  <Text style={styles.controlBtnText}>Pause Field Work</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.controlBtn, { backgroundColor: '#1b4d3e' }]} onPress={handleStartWork}>
                  <Play size={18} color="#ffffff" />
                  <Text style={styles.controlBtnText}>Engage Field Telematics</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={[styles.controlBtn, { backgroundColor: '#10b981' }]} onPress={handleCompleteJob}>
                <CheckCircle2 size={18} color="#ffffff" />
                <Text style={styles.controlBtnText}>Complete & Sign-off</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Live Cockpit Telemetry HUD */}
        <Text style={styles.hudTitle}>Real-Time Sensor Telemetry (IoT)</Text>
        <View style={styles.hudGrid}>
          <View style={styles.hudCard}>
            <Gauge color="#1b4d3e" size={20} />
            <Text style={styles.hudValue}>{telemetry?.rpm || 1950} RPM</Text>
            <Text style={styles.hudLabel}>Engine Speed</Text>
          </View>

          <View style={styles.hudCard}>
            <Flame color="#ea580c" size={20} />
            <Text style={styles.hudValue}>{telemetry?.engineTemperatureC || 86}°C</Text>
            <Text style={styles.hudLabel}>Coolant Temp</Text>
          </View>

          <View style={styles.hudCard}>
            <Fuel color="#0284c7" size={20} />
            <Text style={styles.hudValue}>{telemetry?.fuelLevelPercent || 78}%</Text>
            <Text style={styles.hudLabel}>Diesel Level</Text>
          </View>

          <View style={styles.hudCard}>
            <Clock color="#7c3aed" size={20} />
            <Text style={styles.hudValue}>{telemetry?.engineHours || 412.8} h</Text>
            <Text style={styles.hudLabel}>Total Operating Time</Text>
          </View>
        </View>

        {/* Fuel & Field Entry Logger */}
        <View style={styles.fuelCard}>
          <View style={styles.fuelHeader}>
            <Fuel color="#1b4d3e" size={20} />
            <Text style={styles.fuelTitle}>Operator Quick Fuel Log</Text>
          </View>
          <Text style={styles.fuelDesc}>Log diesel refills during shift to adjust billing telematics surcharge.</Text>
          <TouchableOpacity style={styles.fuelBtn} onPress={handleAddFuel}>
            <Text style={styles.fuelBtnText}>+ Log 20L Diesel Refill (Current: {fuelAdded}L)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F9F8F3',
  },
  responsiveWrapper: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  pilotHeaderCard: {
    backgroundColor: '#1b4d3e',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  pilotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pilotAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pilotInitial: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1b4d3e',
  },
  pilotName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  pilotRole: {
    fontSize: 11,
    color: '#a3cfbb',
    marginTop: 2,
    fontWeight: '600',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#10b981',
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    elevation: 1,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1b4d3e',
    textTransform: 'uppercase',
  },
  farmerName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a202c',
    marginTop: 2,
  },
  rateBadge: {
    backgroundColor: '#e6f4ea',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rateText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1b4d3e',
  },
  jobInfoBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    gap: 6,
    marginBottom: 14,
  },
  jobInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jobLocationText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  jobPhoneText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  jobHoursText: {
    fontSize: 12,
    color: '#64748b',
  },
  controlsRow: {
    gap: 8,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  controlBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  hudTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1a202c',
    marginBottom: 10,
  },
  hudGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  hudCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  hudValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a202c',
    marginTop: 6,
  },
  hudLabel: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '600',
    marginTop: 2,
  },
  fuelCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  fuelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  fuelTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1b4d3e',
  },
  fuelDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
    marginBottom: 12,
  },
  fuelBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  fuelBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1b4d3e',
  },
});
