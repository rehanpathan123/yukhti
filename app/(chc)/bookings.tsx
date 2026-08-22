import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useKisanOpsStore } from '../../src/store/kisanOpsStore';
import { Calendar, CheckCircle2, Truck, Clock, User, Phone, MapPin, Check, Play, AlertCircle } from 'lucide-react-native';
import { BookingStatus } from '../../src/types';

export default function CHCBookingsScreen() {
  const { state, updateBookingStatus } = useKisanOpsStore();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const filteredBookings = state.bookings.filter(b => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return b.status === 'PENDING' || b.status === 'CONFIRMED';
    if (filter === 'ACTIVE') return b.status === 'DISPATCHED' || b.status === 'IN_PROGRESS';
    return b.status === 'COMPLETED' || b.status === 'CANCELLED';
  });

  const handleAction = (bookingId: string, nextStatus: BookingStatus, title: string) => {
    updateBookingStatus(bookingId, nextStatus);
    Alert.alert('Status Updated', `Booking has been moved to ${nextStatus}.`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.responsiveWrapper}>
        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['ALL', 'PENDING', 'ACTIVE', 'COMPLETED'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterPill, filter === tab && styles.filterPillActive]}
              onPress={() => setFilter(tab)}
            >
              <Text style={[styles.filterText, filter === tab && styles.filterTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          filteredBookings.map(booking => {
            const statusColor = 
              booking.status === 'COMPLETED' ? '#10b981' :
              booking.status === 'IN_PROGRESS' || booking.status === 'DISPATCHED' ? '#3b82f6' :
              booking.status === 'CONFIRMED' ? '#8b5cf6' : '#f59e0b';

            return (
              <View key={booking.id} style={styles.bookingCard}>
                {/* Header */}
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.bookingNumber}>{booking.bookingNumber}</Text>
                    <Text style={styles.machineTitle}>{booking.machineModel}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20`, borderColor: statusColor }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>{booking.status}</Text>
                  </View>
                </View>

                {/* Farmer & Location Details */}
                <View style={styles.detailBox}>
                  <View style={styles.detailRow}>
                    <User size={14} color="#64748b" />
                    <Text style={styles.detailText}>Farmer: <Text style={styles.boldText}>{booking.farmerName}</Text></Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Phone size={14} color="#64748b" />
                    <Text style={styles.detailText}>{booking.farmerPhone}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MapPin size={14} color="#64748b" />
                    <Text style={styles.detailText}>{booking.farmLocation}</Text>
                  </View>
                </View>

                {/* Rate & Hours */}
                <View style={styles.priceRow}>
                  <View>
                    <Text style={styles.priceLabel}>Estimated Bill</Text>
                    <Text style={styles.priceValue}>₹{booking.estimatedTotal}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.priceLabel}>Duration</Text>
                    <Text style={styles.hoursValue}>{booking.bookedHours} Hours ({booking.bookingMode})</Text>
                  </View>
                </View>

                {/* Operator Assigned */}
                <View style={styles.operatorRow}>
                  <Text style={styles.operatorText}>
                    🚜 Assigned Operator: <Text style={{ fontWeight: '800', color: '#1b4d3e' }}>{booking.operatorName || 'Raju Verma'}</Text>
                  </Text>
                </View>

                {/* Action Buttons based on status */}
                <View style={styles.actionRow}>
                  {booking.status === 'PENDING' && (
                    <TouchableOpacity
                      style={[styles.btn, { backgroundColor: '#1b4d3e' }]}
                      onPress={() => handleAction(booking.id, 'CONFIRMED', 'Confirmed')}
                    >
                      <Check size={16} color="#ffffff" />
                      <Text style={styles.btnText}>Approve Booking</Text>
                    </TouchableOpacity>
                  )}

                  {booking.status === 'CONFIRMED' && (
                    <TouchableOpacity
                      style={[styles.btn, { backgroundColor: '#0284c7' }]}
                      onPress={() => handleAction(booking.id, 'DISPATCHED', 'Dispatched')}
                    >
                      <Truck size={16} color="#ffffff" />
                      <Text style={styles.btnText}>Dispatch Machine</Text>
                    </TouchableOpacity>
                  )}

                  {booking.status === 'DISPATCHED' && (
                    <TouchableOpacity
                      style={[styles.btn, { backgroundColor: '#7c3aed' }]}
                      onPress={() => handleAction(booking.id, 'IN_PROGRESS', 'In Progress')}
                    >
                      <Play size={16} color="#ffffff" />
                      <Text style={styles.btnText}>Start Field Work</Text>
                    </TouchableOpacity>
                  )}

                  {booking.status === 'IN_PROGRESS' && (
                    <TouchableOpacity
                      style={[styles.btn, { backgroundColor: '#10b981' }]}
                      onPress={() => handleAction(booking.id, 'COMPLETED', 'Completed')}
                    >
                      <CheckCircle2 size={16} color="#ffffff" />
                      <Text style={styles.btnText}>Complete & Generate Invoice</Text>
                    </TouchableOpacity>
                  )}

                  {booking.status === 'COMPLETED' && (
                    <View style={styles.completedBadge}>
                      <CheckCircle2 size={16} color="#10b981" />
                      <Text style={styles.completedText}>Work completed & invoice generated</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyCard}>
            <AlertCircle size={32} color="#94a3b8" />
            <Text style={styles.emptyText}>No bookings found under this filter.</Text>
          </View>
        )}
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
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
  bookingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingNumber: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1b4d3e',
    textTransform: 'uppercase',
  },
  machineTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1a202c',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  detailBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#475569',
  },
  boldText: {
    fontWeight: '800',
    color: '#1e293b',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1b4d3e',
  },
  hoursValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  operatorRow: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
    marginBottom: 12,
  },
  operatorText: {
    fontSize: 12,
    color: '#475569',
  },
  actionRow: {
    marginTop: 4,
  },
  btn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
});
