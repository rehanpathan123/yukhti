import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useKisanOpsStore } from '../../src/store/kisanOpsStore';
import { Tractor, CheckCircle2, AlertTriangle, ShieldCheck, Wrench, Thermometer, Battery, Disc } from 'lucide-react-native';

export default function OperatorDiagnosticsScreen() {
  const { state } = useKisanOpsStore();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    oil: true,
    coolant: true,
    tyres: true,
    cutter: true,
    gps: true,
  });

  const machine = state.machines[0] || {
    identifier: 'JD-HARV-07',
    model: 'John Deere W70 Harvester',
    healthScore: 94,
    powerHp: 75,
  };

  const toggleCheck = (key: string) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSignOff = () => {
    Alert.alert('Pre-Flight Signed', 'Digital safety inspection recorded on CHC centralized telemetry ledger.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.responsiveWrapper}>
        {/* Machine Overview */}
        <View style={styles.machineCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.machineTitle}>{machine.model}</Text>
              <Text style={styles.machineId}>{machine.identifier} • {machine.powerHp} HP Turbo</Text>
            </View>
            <View style={styles.healthBadge}>
              <Text style={styles.healthText}>{machine.healthScore}% Health</Text>
            </View>
          </View>
        </View>

        {/* Pre-Shift Checklist */}
        <Text style={styles.sectionHeader}>Daily Pre-Shift Inspection</Text>
        <View style={styles.checklistCard}>
          {[
            { id: 'oil', label: 'Engine Oil & Transmission Fluid Levels', icon: <Thermometer size={16} color="#1b4d3e" /> },
            { id: 'coolant', label: 'Radiator Coolant & Particulate Screen', icon: <Battery size={16} color="#1b4d3e" /> },
            { id: 'cutter', label: 'Harvester Cutter Bar & Threshing Drum Teeth', icon: <Disc size={16} color="#1b4d3e" /> },
            { id: 'tyres', label: 'Tyre Pressure / Track Tension (28 PSI)', icon: <Tractor size={16} color="#1b4d3e" /> },
            { id: 'gps', label: 'IoT Telematics & GPS Antenna Sync', icon: <ShieldCheck size={16} color="#1b4d3e" /> },
          ].map(item => (
            <TouchableOpacity key={item.id} style={styles.checkItem} onPress={() => toggleCheck(item.id)}>
              <View style={styles.checkLeft}>
                {item.icon}
                <Text style={styles.checkLabel}>{item.label}</Text>
              </View>
              <View style={[styles.checkbox, checkedItems[item.id] && styles.checkboxActive]}>
                {checkedItems[item.id] && <CheckCircle2 size={16} color="#ffffff" />}
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.submitBtn} onPress={handleSignOff}>
            <Text style={styles.submitBtnText}>Submit Digital Pre-Shift Log</Text>
          </TouchableOpacity>
        </View>

        {/* Sensor Diagnostics */}
        <Text style={styles.sectionHeader}>Sub-System Diagnostics</Text>
        <View style={styles.diagGrid}>
          <View style={styles.diagItem}>
            <Text style={styles.diagLabel}>Hydraulic Pressure</Text>
            <Text style={styles.diagVal}>210 Bar (Nominal)</Text>
          </View>
          <View style={styles.diagItem}>
            <Text style={styles.diagLabel}>Battery Voltage</Text>
            <Text style={styles.diagVal}>13.8 V (Optimal)</Text>
          </View>
          <View style={styles.diagItem}>
            <Text style={styles.diagLabel}>Fuel Burn Variance</Text>
            <Text style={[styles.diagVal, { color: '#10b981' }]}>+0.2% Normal</Text>
          </View>
          <View style={styles.diagItem}>
            <Text style={styles.diagLabel}>Service Due In</Text>
            <Text style={styles.diagVal}>64 Operating Hrs</Text>
          </View>
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
  machineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  machineTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1a202c',
  },
  machineId: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  healthBadge: {
    backgroundColor: '#e6f4ea',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  healthText: {
    color: '#1b4d3e',
    fontWeight: '900',
    fontSize: 12,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1a202c',
    marginBottom: 10,
  },
  checklistCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  checkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  checkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },
  checkLabel: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#1b4d3e',
    borderColor: '#1b4d3e',
  },
  submitBtn: {
    backgroundColor: '#1b4d3e',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  diagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  diagItem: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  diagLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  diagVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 4,
  },
});
