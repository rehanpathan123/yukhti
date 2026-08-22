import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useKisanOpsStore } from '../../src/store/kisanOpsStore';
import { Tractor, Search, Wrench, BatteryCharging, Gauge, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { MachineStatus } from '../../src/types';

export default function CHCFleetScreen() {
  const { state, updateMachineStatus } = useKisanOpsStore();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'IDLE' | 'MAINTENANCE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMachines = state.machines.filter(m => {
    const matchesFilter = 
      filter === 'ALL' ? true :
      filter === 'ACTIVE' ? (m.status === 'ACTIVE' || m.status === 'IN_USE') :
      filter === 'IDLE' ? m.status === 'IDLE' :
      (m.status === 'MAINTENANCE' || m.status === 'BREAKDOWN');

    const matchesSearch = 
      m.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleToggleMaintenance = (machineId: string, currentStatus: MachineStatus) => {
    const nextStatus: MachineStatus = currentStatus === 'MAINTENANCE' ? 'IDLE' : 'MAINTENANCE';
    updateMachineStatus(machineId, nextStatus);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.responsiveWrapper}>
        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Search color="#718096" size={18} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID, model, or category..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['ALL', 'ACTIVE', 'IDLE', 'MAINTENANCE'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterPill, filter === tab && styles.filterPillActive]}
              onPress={() => setFilter(tab)}
            >
              <Text style={[styles.filterText, filter === tab && styles.filterTextActive]}>
                {tab === 'ALL' ? `All (${state.machines.length})` : tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fleet List */}
        {filteredMachines.map(machine => {
          const isHealthy = machine.healthScore >= 80;
          const statusColor = 
            machine.status === 'ACTIVE' || machine.status === 'IN_USE' ? '#10b981' :
            machine.status === 'IDLE' ? '#3b82f6' : '#f59e0b';

          return (
            <View key={machine.id} style={styles.machineCard}>
              <View style={styles.cardHeader}>
                <View style={styles.machineTitleBox}>
                  <Text style={styles.machineModel}>{machine.brand} {machine.model}</Text>
                  <Text style={styles.machineId}>{machine.identifier} • {machine.powerHp} HP</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20`, borderColor: statusColor }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.statusText, { color: statusColor }]}>{machine.status}</Text>
                </View>
              </View>

              {/* Specs & Health Metrics */}
              <View style={styles.metricGrid}>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>Health Score</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Gauge size={16} color={isHealthy ? '#10b981' : '#f59e0b'} />
                    <Text style={[styles.metricVal, { color: isHealthy ? '#10b981' : '#f59e0b' }]}>
                      {machine.healthScore}%
                    </Text>
                  </View>
                </View>

                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>Engine Hours</Text>
                  <Text style={styles.metricVal}>{machine.totalEngineHours} hrs</Text>
                </View>

                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>Hourly Rate</Text>
                  <Text style={[styles.metricVal, { color: '#1b4d3e' }]}>₹{machine.baseRatePerHour}</Text>
                </View>
              </View>

              {/* Operator info & Action */}
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.operatorLabel}>Assigned Operator</Text>
                  <Text style={styles.operatorName}>{machine.operatorName || 'Raju Verma'}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.maintBtn,
                    machine.status === 'MAINTENANCE' && styles.maintBtnActive
                  ]}
                  onPress={() => handleToggleMaintenance(machine.id, machine.status)}
                >
                  <Wrench size={14} color={machine.status === 'MAINTENANCE' ? '#ffffff' : '#475569'} />
                  <Text style={[
                    styles.maintBtnText,
                    machine.status === 'MAINTENANCE' && styles.maintBtnTextActive
                  ]}>
                    {machine.status === 'MAINTENANCE' ? 'Return to Service' : 'Flag Service'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1a202c',
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  filterPillActive: {
    backgroundColor: '#1b4d3e',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  machineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  machineTitleBox: {
    flex: 1,
  },
  machineModel: {
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  metricGrid: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  metricCol: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  operatorLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
  },
  operatorName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  maintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  maintBtnActive: {
    backgroundColor: '#ea580c',
  },
  maintBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  maintBtnTextActive: {
    color: '#ffffff',
  },
});
