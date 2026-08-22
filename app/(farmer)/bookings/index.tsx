import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Linking, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useKisanOpsStore } from '../../../src/store/kisanOpsStore';
import { t } from '../../../i18n/translations';
import { SaathiWidget } from '../../../components/SaathiWidget';
import { Phone, FileText, Navigation, CheckCircle } from 'lucide-react-native';

export default function BookingsScreen() {
  const router = useRouter();
  const { state } = useKisanOpsStore();
  const { bookings, invoices } = state;
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'ACTIVE' | 'COMPLETED'>('UPCOMING');

  const getStatusText = (status: string) => {
    switch (status) {
      case 'REQUESTED': return t('bookings.statusRequested');
      case 'CONFIRMED': return t('bookings.statusConfirmed');
      case 'DISPATCHED': return t('bookings.statusDispatched');
      case 'IN_PROGRESS': return t('bookings.statusInProgress');
      case 'COMPLETED': return t('bookings.statusCompleted');
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return '#0284c7'; // Sky
      case 'DISPATCHED': return '#d97706'; // Amber
      case 'IN_PROGRESS': return '#2563eb'; // Blue
      case 'COMPLETED': return '#16a34a'; // Green
      default: return '#718096';
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'ACTIVE') {
      return b.status === 'DISPATCHED' || b.status === 'IN_PROGRESS';
    }
    if (activeTab === 'UPCOMING') {
      return b.status === 'CONFIRMED' || b.status === 'REQUESTED';
    }
    return b.status === 'COMPLETED' || b.status === 'CANCELLED';
  });

  const handleShareInvoice = (bookingNumber: string) => {
    const invoice = invoices.find(inv => inv.bookingNumber === bookingNumber);
    const invoiceMsg = invoice 
      ? `KisanOps Tax Receipt #${invoice.invoiceNumber}\nTotal: ₹${invoice.finalTotalAmount}\nRate: ₹${invoice.baseRatePerHour}/hr for ${invoice.actualHours} hrs.`
      : `Rental invoice for Booking ${bookingNumber}.`;
    
    Share.share({
      message: invoiceMsg,
      title: 'Share Invoice',
    });
  };

  return (
    <View style={styles.container}>
      {/* Sub tabs */}
      <View style={styles.tabContainer}>
        {(['UPCOMING', 'ACTIVE', 'COMPLETED'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'UPCOMING' && t('bookings.upcoming')}
              {tab === 'ACTIVE' && t('bookings.active')}
              {tab === 'COMPLETED' && t('bookings.completed')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No bookings found in this category.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.modelName}>{item.machineModel}</Text>
                <Text style={styles.bookingNum}>#{item.bookingNumber}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {getStatusText(item.status)}
                </Text>
              </View>
            </View>

            <View style={styles.detailsBlock}>
              <Text style={styles.detailText}>📅 Date: {new Date(item.startTime).toLocaleDateString()}</Text>
              <Text style={styles.detailText}>⏱️ Duration: {item.bookedHours} hours</Text>
              <Text style={styles.detailText}>💰 Rate: ₹{item.hourlyRate}/hr</Text>
              <Text style={styles.detailText}>💳 Method: {item.paymentMethod.replace('_', ' ')}</Text>
            </View>

            {/* Operator section */}
            {item.operatorName && (
              <View style={styles.operatorBox}>
                <Text style={styles.operatorLabel}>{t('bookings.operator')}:</Text>
                <Text style={styles.operatorValue}>{item.operatorName}</Text>
              </View>
            )}

            {/* Action buttons */}
            <View style={styles.footerRow}>
              {/* Dial Operator */}
              {item.operatorPhone && item.status !== 'COMPLETED' && item.status !== 'CANCELLED' && (
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => Linking.openURL(`tel:${item.operatorPhone}`)}
                >
                  <Phone color="#1b4d3e" size={18} />
                  <Text style={styles.actionIconText}>Call Driver</Text>
                </TouchableOpacity>
              )}

              {/* Share/View Invoice */}
              {item.status === 'COMPLETED' && (
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => handleShareInvoice(item.bookingNumber)}
                >
                  <FileText color="#1b4d3e" size={18} />
                  <Text style={styles.actionIconText}>Invoice</Text>
                </TouchableOpacity>
              )}

              {/* Track Live GPS */}
              {(item.status === 'DISPATCHED' || item.status === 'IN_PROGRESS' || item.status === 'CONFIRMED') && (
                <TouchableOpacity
                  style={styles.trackBtn}
                  onPress={() => router.push({
                    pathname: '/(farmer)/track/[bookingId]',
                    params: { bookingId: item.id }
                  })}
                >
                  <Navigation color="#ffffff" size={16} />
                  <Text style={styles.trackBtnText}>{t('bookings.track')}</Text>
                </TouchableOpacity>
              )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#cbd5e0',
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  tabBtnActive: {
    borderColor: '#1b4d3e',
  },
  tabText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#718096',
  },
  tabTextActive: {
    color: '#1b4d3e',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#718096',
    fontWeight: '600',
    fontSize: 13,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f7fafc',
    paddingBottom: 10,
    marginBottom: 12,
  },
  modelName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  bookingNum: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  detailsBlock: {
    gap: 4,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 13,
    color: '#4a5568',
    fontWeight: '600',
  },
  operatorBox: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#f7fafc',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  operatorLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: 'bold',
  },
  operatorValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  actionIconText: {
    color: '#1b4d3e',
    fontWeight: 'bold',
    fontSize: 12,
  },
  trackBtn: {
    backgroundColor: '#1b4d3e',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 10,
  },
  trackBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
