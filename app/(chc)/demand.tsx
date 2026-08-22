import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useKisanOpsStore } from '../../src/store/kisanOpsStore';
import { TrendingUp, MapPin, Sparkles, AlertCircle, ArrowUpRight, Zap } from 'lucide-react-native';

export default function CHCDemandScreen() {
  const { state } = useKisanOpsStore();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.responsiveWrapper}>
        {/* Banner */}
        <View style={styles.aiBanner}>
          <View style={styles.aiIconBox}>
            <Sparkles color="#ffd700" size={22} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiTitle}>AI Demand Intelligence Engine</Text>
            <Text style={styles.aiSub}>
              Satellite vegetation indices & rainfall radar indicate peak wheat harvesting surge in Sehore district.
            </Text>
          </View>
        </View>

        {/* Village Demand Clusters */}
        <Text style={styles.sectionHeader}>Village Cluster Forecasts</Text>
        {state.demandForecasts.map(forecast => {
          const isHigh = forecast.demandSurgeProbabilityPercent >= 75;

          return (
            <View key={forecast.id} style={styles.clusterCard}>
              <View style={styles.clusterHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MapPin color="#1b4d3e" size={16} />
                  <Text style={styles.clusterVillage}>{forecast.villageCluster}, {forecast.district}</Text>
                </View>
                <View style={[styles.surgeBadge, { backgroundColor: isHigh ? '#fee2e2' : '#fef3c7' }]}>
                  <Zap size={12} color={isHigh ? '#dc2626' : '#d97706'} />
                  <Text style={[styles.surgeText, { color: isHigh ? '#dc2626' : '#d97706' }]}>
                    {forecast.demandSurgeProbabilityPercent}% Surge Risk
                  </Text>
                </View>
              </View>

              <View style={styles.clusterMetrics}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Primary Crop</Text>
                  <Text style={styles.metricVal}>{forecast.cropName} ({forecast.cropStage})</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Total Acreage</Text>
                  <Text style={styles.metricVal}>{forecast.totalAcreage} Acres</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Required Fleet</Text>
                  <Text style={[styles.metricVal, { color: '#1b4d3e' }]}>
                    {forecast.recommendedMachineCount} Harvesters
                  </Text>
                </View>
              </View>

              <View style={styles.windowBox}>
                <Text style={styles.windowLabel}>Optimal Harvesting Window</Text>
                <Text style={styles.windowVal}>
                  {new Date(forecast.predictedOptimalStart).toLocaleDateString()} - {new Date(forecast.predictedOptimalEnd).toLocaleDateString()}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Fleet Allocation AI Recommendations */}
        <Text style={[styles.sectionHeader, { marginTop: 12 }]}>AI Rebalancing Directives</Text>
        {state.allocations.map(rec => (
          <View key={rec.id} style={styles.recCard}>
            <View style={styles.recHeader}>
              <Text style={styles.recMachine}>{rec.machineCategory} Reallocation</Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>{(rec.confidenceScore * 100).toFixed(0)}% Confidence</Text>
              </View>
            </View>
            <Text style={styles.recReason}>{rec.rationale}</Text>
            <View style={styles.recFooter}>
              <Text style={styles.recRevenue}>Estimated Uplift: <Text style={{ color: '#10b981', fontWeight: '800' }}>+₹{rec.expectedRevenueBoost}</Text></Text>
            </View>
          </View>
        ))}
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
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1b4d3e',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  aiIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
  },
  aiSub: {
    fontSize: 11,
    color: '#a3cfbb',
    marginTop: 2,
    lineHeight: 15,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1a202c',
    marginBottom: 10,
  },
  clusterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
    elevation: 1,
  },
  clusterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clusterVillage: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
  },
  surgeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  surgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  clusterMetrics: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metricVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginTop: 2,
  },
  windowBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
  },
  windowLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  windowVal: {
    fontSize: 11,
    color: '#1b4d3e',
    fontWeight: '800',
  },
  recCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
    elevation: 1,
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  recMachine: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a202c',
  },
  confidenceBadge: {
    backgroundColor: '#e6f4ea',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1b4d3e',
  },
  recReason: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 8,
  },
  recFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 6,
  },
  recRevenue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
});
