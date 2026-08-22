import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKisanOpsStore } from '../../../src/store/kisanOpsStore';
import { t } from '../../../i18n/translations';
import { Star, ShieldCheck, Sparkles, AlertTriangle, Calendar, Clock, CreditCard } from 'lucide-react-native';
import { scoreMachineForFarmer } from '../../../src/lib/recommendationEngine';
import { calculateDynamicPrice } from '../../../src/lib/pricingEngine';

export default function MachineDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { state, createBooking } = useKisanOpsStore();
  const { machines, farm, currentUser, agriCredit } = state;

  const [bookingStep, setBookingStep] = useState(1); // 1: Setup Details, 2: Checkout / Pay
  const [bookedHours, setBookedHours] = useState('6');
  const [targetDate, setTargetDate] = useState('2026-08-23');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'AGRICREDIT_DEFERRED'>('AGRICREDIT_DEFERRED');
  const [submitting, setSubmitting] = useState(false);

  const machine = machines.find(m => m.id === id);

  if (!machine) {
    return (
      <View style={styles.errorContainer}>
        <AlertTriangle color="#c62828" size={32} />
        <Text style={styles.errorText}>Machine not found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Matching & Pricing calculations
  const matchResult = scoreMachineForFarmer(machine, { farm, activity: 'HARVESTING' });
  const priceQuote = calculateDynamicPrice(machine, {
    demandIndex: 94,
    shortageUnits: 2,
    distanceKm: machine.distanceKm || 3.2
  });

  const hourlyRate = priceQuote.quotedRatePerHour;
  const hoursNum = parseFloat(bookedHours) || 6;
  const subtotal = Math.round(hoursNum * hourlyRate);
  const transit = 300;
  const discount = 100;
  const platform = 100;
  const beforeTax = subtotal + transit + platform - discount;
  const gst = Math.round(beforeTax * 0.05);
  const totalBill = beforeTax + gst;

  const isAgriCreditEligible = agriCredit.availableCredit >= totalBill;

  const handleExecuteBooking = () => {
    setSubmitting(true);
    setTimeout(() => {
      const newBooking = createBooking({
        farmerId: currentUser.id,
        farmerName: currentUser.fullName,
        farmerPhone: currentUser.phoneNumber,
        chcId: machine.chcId,
        chcName: machine.chcName,
        machineId: machine.id,
        machineIdentifier: machine.identifier,
        machineModel: `${machine.brand} ${machine.model}`,
        machineCategory: machine.category,
        farmId: farm.id,
        farmName: farm.farmName || 'My Farmland',
        farmLocation: `${farm.village}, ${farm.district}`,
        activity: (machine.category === 'HARVESTER' ? 'HARVESTING' : 'SOIL_PREPARATION') as any,
        status: 'CONFIRMED',
        bookingMode: 'HOURLY',
        bookedHours: hoursNum,
        startTime: targetDate + 'T08:00:00.000Z',
        endTime: targetDate + 'T14:00:00.000Z',
        hourlyRate: hourlyRate,
        estimatedTotal: totalBill,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'AGRICREDIT_DEFERRED' ? 'AUTHORIZED' : 'CAPTURED',
        operatorName: machine.operatorName || 'Raju Verma',
        operatorPhone: machine.operatorPhone || '+91 97550 12399',
      });

      setSubmitting(false);
      // Redirect to dispatch tracking immediately
      router.replace({
        pathname: '/(farmer)/track/[bookingId]',
        params: { bookingId: newBooking.id }
      });
    }, 1500);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Step Indicators */}
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>
          {t('machines.bookingProgress', { step: bookingStep })}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: bookingStep === 1 ? '50%' : '100%' }]} />
        </View>
      </View>

      {bookingStep === 1 ? (
        <View>
          {/* Main Info */}
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.brandTitle}>{machine.brand} {machine.model}</Text>
                <Text style={styles.subBrand}>{machine.identifier} • {machine.specs.engine}</Text>
              </View>
              <View style={styles.matchBadge}>
                <Text style={styles.matchBadgeText}>{matchResult.matchScore}% Match</Text>
              </View>
            </View>

            <View style={styles.quickStats}>
              <Text style={styles.statLabel}>📍 {machine.distanceKm || 3.2} km</Text>
              <Text style={styles.statLabel}>★ {machine.rating}</Text>
              <Text style={[styles.statLabel, { color: '#2e7d32' }]}>{machine.healthScore}% Health</Text>
            </View>
          </View>

          {/* Explainable AI matching */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>🌾 {t('common.whyThisMachine')}</Text>
            <View style={styles.reasonsBox}>
              {matchResult.reasons.map((r, idx) => (
                <View key={idx} style={styles.reasonRow}>
                  <Text style={styles.reasonCheck}>✓</Text>
                  <Text style={styles.reasonText}>{r}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Dynamic Pricing breakdown */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>💰 {t('common.whyThisPrice')}</Text>
            <Text style={styles.priceIntro}>Transparent rate breakdown matched from existing match limits:</Text>
            
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>{t('machines.baseRate')}:</Text>
              <Text style={styles.priceVal}>₹{machine.baseRatePerHour}/hr</Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>{t('machines.demandSurge')}:</Text>
              <Text style={styles.priceVal}>+₹{priceQuote.demandAdjustment}/hr</Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>{t('machines.discount')} (Health):</Text>
              <Text style={[styles.priceVal, { color: '#2e7d32' }]}>-₹{priceQuote.healthDiscount}/hr</Text>
            </View>
            <View style={[styles.priceItem, styles.totalPriceItem]}>
              <Text style={styles.totalPriceLabel}>Final Rate:</Text>
              <Text style={styles.totalPriceVal}>₹{hourlyRate}/hour</Text>
            </View>
          </View>

          {/* Setup details form */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>📅 {t('machines.chooseDate')}</Text>
            
            <Text style={styles.formLabel}>Date (तारीख)</Text>
            <TextInput
              style={styles.formInput}
              value={targetDate}
              onChangeText={setTargetDate}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.formLabel}>Booking Duration (घंटे)</Text>
            <TextInput
              style={styles.formInput}
              value={bookedHours}
              onChangeText={setBookedHours}
              keyboardType="numeric"
              placeholder="e.g. 6"
            />

            <TouchableOpacity style={styles.actionBtn} onPress={() => setBookingStep(2)}>
              <Text style={styles.actionBtnText}>{t('common.next')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View>
          {/* Checkout review */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>🛒 {t('machines.reviewPrice')}</Text>
            
            <View style={styles.billItem}>
              <Text style={styles.billLabel}>Rental ({hoursNum} hours × ₹{hourlyRate}):</Text>
              <Text style={styles.billVal}>₹{subtotal}</Text>
            </View>
            <View style={styles.billItem}>
              <Text style={styles.billLabel}>Transit Mobilization:</Text>
              <Text style={styles.billVal}>+₹{transit}</Text>
            </View>
            <View style={styles.billItem}>
              <Text style={styles.billLabel}>Platform J1939 Telematics Fee:</Text>
              <Text style={styles.billVal}>+₹{platform}</Text>
            </View>
            <View style={styles.billItem}>
              <Text style={styles.billLabel}>Discounts:</Text>
              <Text style={[styles.billVal, { color: '#2e7d32' }]}>-₹{discount}</Text>
            </View>
            <View style={styles.billItem}>
              <Text style={styles.billLabel}>GST (5%):</Text>
              <Text style={styles.billVal}>+₹{gst}</Text>
            </View>
            
            <View style={[styles.billItem, styles.billTotalRow]}>
              <Text style={styles.billTotalLabel}>Total:</Text>
              <Text style={styles.billTotalVal}>₹{totalBill}</Text>
            </View>
          </View>

          {/* Payment Selection */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>💳 Choose Payment Method</Text>

            {/* AgriCredit Option */}
            <TouchableOpacity
              style={[styles.payOption, paymentMethod === 'AGRICREDIT_DEFERRED' && styles.payOptionActive, !isAgriCreditEligible && styles.payOptionDisabled]}
              onPress={() => isAgriCreditEligible && setPaymentMethod('AGRICREDIT_DEFERRED')}
              disabled={!isAgriCreditEligible}
            >
              <View style={styles.payLeft}>
                <Text style={styles.payIcon}>🌾</Text>
                <View>
                  <Text style={styles.payTitle}>{t('common.payAfterHarvest')} (AgriCredit)</Text>
                  <Text style={styles.payDesc}>Available Limit: ₹{agriCredit.availableCredit}</Text>
                </View>
              </View>
              <View style={[styles.radio, paymentMethod === 'AGRICREDIT_DEFERRED' && styles.radioActive]} />
            </TouchableOpacity>

            {/* Normal UPI/Card Option */}
            <TouchableOpacity
              style={[styles.payOption, paymentMethod === 'UPI' && styles.payOptionActive]}
              onPress={() => setPaymentMethod('UPI')}
            >
              <View style={styles.payLeft}>
                <Text style={styles.payIcon}>💳</Text>
                <View>
                  <Text style={styles.payTitle}>UPI / Card / NetBanking</Text>
                  <Text style={styles.payDesc}>Pay securely via Razorpay Checkout</Text>
                </View>
              </View>
              <View style={[styles.radio, paymentMethod === 'UPI' && styles.radioActive]} />
            </TouchableOpacity>

            {!isAgriCreditEligible && (
              <View style={styles.limitWarning}>
                <Text style={styles.limitWarningText}>
                  ⚠️ Available credit limit is insufficient for this booking total. Please choose digital payments.
                </Text>
              </View>
            )}
          </View>

          {/* Confirmation controls */}
          <View style={styles.checkoutActions}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setBookingStep(1)}>
              <Text style={styles.secondaryBtnText}>{t('common.back')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.primaryBtn} onPress={handleExecuteBooking} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {paymentMethod === 'AGRICREDIT_DEFERRED' ? 'Book with AgriCredit' : 'Pay & Confirm'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F9F8F3', // Warm off-white
    flexGrow: 1,
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
  },
  progressHeader: {
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#e69b00',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#cbd5e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: '#1b4d3e',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F9F8F3',
  },
  errorText: {
    fontSize: 16,
    color: '#2d3748',
    fontWeight: 'bold',
    marginTop: 12,
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    marginBottom: 14,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a202c',
  },
  subBrand: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
    marginTop: 2,
  },
  matchBadge: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchBadgeText: {
    color: '#d97706',
    fontSize: 11,
    fontWeight: 'bold',
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 10,
  },
  reasonsBox: {
    gap: 8,
  },
  reasonRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  reasonCheck: {
    color: '#2e7d32',
    fontWeight: '900',
  },
  reasonText: {
    fontSize: 13,
    color: '#4a5568',
    fontWeight: '600',
  },
  priceIntro: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 12,
  },
  priceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f7fafc',
  },
  priceLabel: {
    fontSize: 13,
    color: '#4a5568',
    fontWeight: '600',
  },
  priceVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  totalPriceItem: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  totalPriceLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  totalPriceVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1b4d3e',
  },
  formLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4a5568',
    marginBottom: 6,
    marginTop: 10,
  },
  formInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 12,
    backgroundColor: '#f7fafc',
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '600',
    color: '#1a202c',
  },
  actionBtn: {
    backgroundColor: '#1b4d3e',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  actionBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f7fafc',
  },
  billLabel: {
    fontSize: 13,
    color: '#4a5568',
    fontWeight: '600',
  },
  billVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  billTotalRow: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  billTotalLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: '#2d3748',
  },
  billTotalVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1b4d3e',
  },
  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#cbd5e0',
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  payOptionActive: {
    borderColor: '#1b4d3e',
    backgroundColor: '#eaf4ee',
  },
  payOptionDisabled: {
    opacity: 0.5,
    backgroundColor: '#f7fafc',
  },
  payLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  payIcon: {
    fontSize: 24,
  },
  payTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  payDesc: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '600',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e0',
  },
  radioActive: {
    borderColor: '#1b4d3e',
    backgroundColor: '#1b4d3e',
  },
  limitWarning: {
    backgroundColor: '#fff5f5',
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  limitWarningText: {
    fontSize: 11,
    color: '#c62828',
    fontWeight: 'bold',
    lineHeight: 14,
  },
  checkoutActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  secondaryBtnText: {
    color: '#4a5568',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  primaryBtn: {
    flex: 1.5,
    backgroundColor: '#e69b00',
    borderRadius: 14,
    paddingVertical: 12,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
});
