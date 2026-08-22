import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useKisanOpsStore } from '../../../src/store/kisanOpsStore';
import { t } from '../../../i18n/translations';
import { SaathiWidget } from '../../../components/SaathiWidget';
import { Star, ShieldCheck, Sparkles } from 'lucide-react-native';
import { scoreMachineForFarmer } from '../../../src/lib/recommendationEngine';
import { calculateDynamicPrice } from '../../../src/lib/pricingEngine';

export default function MachinesScreen() {
  const router = useRouter();
  const { state } = useKisanOpsStore();
  const { machines, farm } = state;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'TRACTOR', emoji: '🚜', label: t('machines.categoryTractor') },
    { id: 'HARVESTER', emoji: '🌾', label: t('machines.categoryHarvester') },
    { id: 'ROTAVATOR', emoji: '🔄', label: t('machines.categoryRotavator') },
    { id: 'SEEDER', emoji: '🌱', label: t('machines.categorySeeder') },
    { id: 'SPRAYER', emoji: '💧', label: t('machines.categorySprayer') },
  ];

  const filteredMachines = machines.filter(m => {
    if (selectedCategory && m.category !== selectedCategory) return false;
    return true;
  }).map(m => {
    // Generate matches dynamically using the original match algorithm
    const matchResult = scoreMachineForFarmer(m, { farm, activity: 'HARVESTING' });
    const priceResult = calculateDynamicPrice(m, {
      demandIndex: 94,
      shortageUnits: 2,
      distanceKm: m.distanceKm || 3.2
    });
    return {
      ...m,
      matchScore: matchResult.matchScore,
      reasons: matchResult.reasons,
      quotedPrice: priceResult.quotedRatePerHour
    };
  }).sort((a, b) => b.matchScore - a.matchScore);

  return (
    <View style={styles.container}>
      {/* Category selector row */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          <TouchableOpacity
            style={[styles.categoryBtn, !selectedCategory && styles.categoryBtnActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextActive]}>⭐ All</Text>
          </TouchableOpacity>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.categoryBtn, selectedCategory === c.id && styles.categoryBtnActive]}
              onPress={() => setSelectedCategory(c.id)}
            >
              <Text style={[styles.categoryText, selectedCategory === c.id && styles.categoryTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Machines List */}
      <FlatList
        data={filteredMachines}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.machineCard}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <Text style={styles.emojiBadge}>
                  {item.category === 'HARVESTER' ? '🌾' : item.category === 'TRACTOR' ? '🚜' : '⚙️'}
                </Text>
                <View>
                  <Text style={styles.brand}>{item.brand} {item.model}</Text>
                  <Text style={styles.identifier}>{item.identifier} • {item.specs.engine}</Text>
                </View>
              </View>
              <View style={styles.matchScoreBadge}>
                <Sparkles color="#d97706" size={12} />
                <Text style={styles.matchScoreText}>{item.matchScore}% Match</Text>
              </View>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsRow}>
              <Text style={styles.statText}>📍 {t('machines.distance', { dist: item.distanceKm || 3.2 })}</Text>
              <Text style={styles.statText}>★ {item.rating}</Text>
              <Text style={[styles.statText, { color: '#2e7d32' }]}>{t('machines.health', { health: item.healthScore })}</Text>
            </View>

            {/* Explanations */}
            <View style={styles.reasonsList}>
              {item.reasons.slice(0, 2).map((r, idx) => (
                <Text key={idx} style={styles.reasonTag}>✓ {r}</Text>
              ))}
            </View>

            {/* Bottom Row */}
            <View style={styles.cardFooter}>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{t('machines.hourlyPrice', { price: item.quotedPrice })}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() => router.push({
                    pathname: '/(farmer)/machines/[id]',
                    params: { id: item.id }
                  })}
                >
                  <Text style={styles.viewBtnText}>{t('common.viewDetails')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() => router.push({
                    pathname: '/(farmer)/machines/[id]',
                    params: { id: item.id }
                  })}
                >
                  <Text style={styles.bookBtnText}>{t('common.bookNow')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <SaathiWidget />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F8F3', // Warm off-white
  },
  categoryContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryBtn: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  categoryBtnActive: {
    backgroundColor: '#1b4d3e',
    borderColor: '#1b4d3e',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
  },
  machineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    marginBottom: 14,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  emojiBadge: {
    fontSize: 28,
    backgroundColor: '#f7fafc',
    width: 48,
    height: 48,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  brand: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  identifier: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '600',
  },
  matchScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  matchScoreText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#d97706',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  statText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  reasonsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 10,
  },
  reasonTag: {
    fontSize: 11,
    color: '#2e7d32',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: 'bold',
  },
  cardFooter: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f7fafc',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  price: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1b4d3e',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  viewBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 10,
    paddingVertical: 10,
    minHeight: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewBtnText: {
    color: '#4a5568',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  bookBtn: {
    flex: 1,
    backgroundColor: '#e69b00',
    borderRadius: 10,
    paddingVertical: 10,
    minHeight: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
});
