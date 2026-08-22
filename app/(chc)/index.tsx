import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useKisanOpsStore } from '../../src/store/kisanOpsStore';
import { 
  Building2, 
  Tractor, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  DollarSign, 
  ArrowRight,
  MapPin,
  Clock,
  Radio
} from 'lucide-react-native';

export default function CHCOverviewScreen() {
  const { state } = useKisanOpsStore();
  const router = useRouter();

  const chc = state.chcs[0] || {
    name: 'Sehore Agri Centre (CHC #01)',
    district: 'Sehore',
    operatingRadiusKm: 35,
    totalMachines: 14,
    activeMachines: 11,
  };

  const totalMachines = state.machines.length;
  const activeMachines = state.machines.filter(m => m.status === 'ACTIVE' || m.status === 'IN_USE').length;
  const pendingBookings = state.bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED').length;
  const inProgressBookings = state.bookings.filter(b => b.status === 'DISPATCHED' || b.status === 'IN_PROGRESS');
  const highSeverityAlerts = state.maintenanceAlerts.filter(a => a.severity === 'HIGH' && !a.isResolved);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.responsiveWrapper}>
        {/* Hub Header Card */}
        <View style={styles.hubHeaderCard}>
          <View style={styles.hubTitleRow}>
            <View style={styles.hubIconCircle}>
              <Building2 color="#ffffff" size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.hubName}>{chc.name}</Text>
              <View style={styles.hubLocationRow}>
                <MapPin color="#a3cfbb" size={14} />
                <Text style={styles.hubLocation}>
                  {chc.district}, MP • {chc.operatingRadiusKm || 35} km coverage
                </Text>
              </View>
            </View>
            <View style={styles.livePulseBadge}>
              <Radio color="#10b981" size={14} />
              <Text style={styles.livePulseText}>LIVE</Text>
            </View>
          </View>
        </View>

        {/* 4 Quick Stat KPIs */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#e6f4ea' }]}>
              <Tractor color="#1b4d3e" size={20} />
            </View>
            <Text style={styles.kpiValue}>{activeMachines}/{totalMachines}</Text>
            <Text style={styles.kpiLabel}>Machines Deployed</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#fef3c7' }]}>
              <Clock color="#d97706" size={20} />
            </View>
            <Text style={styles.kpiValue}>{pendingBookings}</Text>
            <Text style={styles.kpiLabel}>Pending Dispatches</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#e0f2fe' }]}>
              <DollarSign color="#0284c7" size={20} />
            </View>
            <Text style={styles.kpiValue}>₹48.2k</Text>
            <Text style={styles.kpiLabel}>Daily Revenue</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#fee2e2' }]}>
              <AlertTriangle color="#dc2626" size={20} />
            </View>
            <Text style={styles.kpiValue}>{highSeverityAlerts.length}</Text>
            <Text style={styles.kpiLabel}>Critical Alerts</Text>
          </View>
        </View>

        {/* Live Active Field Telematics */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Activity color="#1b4d3e" size={20} />
              <Text style={styles.sectionTitle}>Active Field Dispatches</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(chc)/bookings')}>
              <Text style={styles.seeAllText}>View All ({inProgressBookings.length})</Text>
            </TouchableOpacity>
          </View>

          {inProgressBookings.length > 0 ? (
            inProgressBookings.map((b) => (
              <View key={b.id} style={styles.dispatchItem}>
                <View style={styles.dispatchLeft}>
                  <View style={styles.statusDot} />
                  <View>
                    <Text style={styles.dispatchMachine}>{b.machineModel}</Text>
                    <Text style={styles.dispatchSub}>
                      Farmer: {b.farmerName} • {b.farmLocation}
                    </Text>
                    <Text style={styles.dispatchDriver}>
                      Operator: {b.operatorName || 'Raju Verma'} ({b.operatorPhone})
                    </Text>
                  </View>
                </View>
                <View style={styles.dispatchRight}>
                  <Text style={styles.dispatchRate}>₹{b.hourlyRate}/hr</Text>
                  <Text style={styles.dispatchTime}>{b.bookedHours}h booked</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyBox}>
              <CheckCircle color="#10b981" size={28} />
              <Text style={styles.emptyText}>All fleet units docked or on standby at Sehore yard.</Text>
            </View>
          )}
        </View>

        {/* Maintenance Alerts Ticker */}
        {state.maintenanceAlerts.length > 0 && (
          <View style={[styles.sectionCard, { borderColor: '#fed7aa', backgroundColor: '#fffaf5' }]}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <AlertTriangle color="#ea580c" size={20} />
                <Text style={[styles.sectionTitle, { color: '#c2410c' }]}>Predictive IoT Alerts</Text>
              </View>
            </View>

            {state.maintenanceAlerts.slice(0, 2).map(alert => (
              <View key={alert.id} style={styles.alertRow}>
                <View style={[styles.severityBadge, { backgroundColor: alert.severity === 'HIGH' ? '#dc2626' : '#f59e0b' }]}>
                  <Text style={styles.severityText}>{alert.severity}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertMachine}>{alert.machineIdentifier} ({alert.machineModel})</Text>
                  <Text style={styles.alertDesc}>{alert.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Navigation Action Grid */}
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(chc)/fleet')}>
            <Tractor color="#1b4d3e" size={24} />
            <Text style={styles.actionTitle}>Manage Fleet</Text>
            <Text style={styles.actionSub}>14 Units • Telematics Sensors</Text>
            <ArrowRight color="#1b4d3e" size={16} style={{ marginTop: 8 }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(chc)/demand')}>
            <TrendingUp color="#1b4d3e" size={24} />
            <Text style={styles.actionTitle}>AI Demand</Text>
            <Text style={styles.actionSub}>Bilkisganj & Sehore Clusters</Text>
            <ArrowRight color="#1b4d3e" size={16} style={{ marginTop: 8 }} />
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
  hubHeaderCard: {
    backgroundColor: '#1b4d3e',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  hubTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hubIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hubName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#ffffff',
  },
  hubLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  hubLocation: {
    fontSize: 12,
    color: '#a3cfbb',
    fontWeight: '600',
  },
  livePulseBadge: {
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
  livePulseText: {
    color: '#10b981',
    fontWeight: '900',
    fontSize: 10,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  kpiIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a202c',
  },
  kpiLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1b4d3e',
  },
  seeAllText: {
    fontSize: 12,
    color: '#1b4d3e',
    fontWeight: '700',
  },
  dispatchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dispatchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
  },
  dispatchMachine: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a202c',
  },
  dispatchSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  dispatchDriver: {
    fontSize: 11,
    color: '#1b4d3e',
    fontWeight: '600',
    marginTop: 1,
  },
  dispatchRight: {
    alignItems: 'flex-end',
  },
  dispatchRate: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1b4d3e',
  },
  dispatchTime: {
    fontSize: 11,
    color: '#94a3b8',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  emptyText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#fed7aa',
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  severityText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  alertMachine: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9a3412',
  },
  alertDesc: {
    fontSize: 11,
    color: '#7c2d12',
    marginTop: 1,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a202c',
    marginTop: 8,
  },
  actionSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
});
