import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Share } from 'react-native';
import { useKisanOpsStore } from '../../../src/store/kisanOpsStore';
import { t } from '../../../i18n/translations';
import { SaathiWidget } from '../../../components/SaathiWidget';
import { CreditCard, FileText, Send, CheckCircle2 } from 'lucide-react-native';

export default function PaymentsScreen() {
  const { state } = useKisanOpsStore();
  const { invoices } = state;

  // Calculate totals
  const totalPaid = invoices
    .filter((inv) => inv.paymentStatus === 'CAPTURED')
    .reduce((sum, inv) => sum + inv.finalTotalAmount, 0);

  const totalDeferred = invoices
    .filter((inv) => inv.paymentMethod === 'AGRICREDIT_DEFERRED' && inv.paymentStatus !== 'CAPTURED')
    .reduce((sum, inv) => sum + inv.finalTotalAmount, 0);

  const handleShareInvoice = (invoice: any) => {
    const message = `KisanOps Branded Invoice #${invoice.invoiceNumber}\n` +
      `Date: ${new Date(invoice.issuedAt).toLocaleDateString()}\n` +
      `Machine: ${invoice.machineName}\n` +
      `Duration: ${invoice.actualHours} Hours @ ₹${invoice.baseRatePerHour}/hr\n` +
      `Tax GST: ₹${invoice.taxGstAmount}\n` +
      `Total Paid Amount: ₹${invoice.finalTotalAmount}`;

    Share.share({
      message,
      title: `Invoice #${invoice.invoiceNumber}`,
    });
  };

  return (
    <View style={styles.container}>
      {/* Financial Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>{t('bookings.completed')}</Text>
          <Text style={[styles.summaryVal, { color: '#2e7d32' }]}>₹{totalPaid.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>{t('credit.eligibleLimit')}</Text>
          <Text style={[styles.summaryVal, { color: '#e69b00' }]}>₹{totalDeferred.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      {/* Invoice list */}
      <Text style={styles.listHeader}>🧾 Rental Invoices & Receipts</Text>
      
      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No invoices generated yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.invoiceCard}>
            <View style={styles.invoiceHeader}>
              <View>
                <Text style={styles.invoiceNum}>#{item.invoiceNumber}</Text>
                <Text style={styles.invoiceDate}>{new Date(item.issuedAt).toLocaleDateString()}</Text>
              </View>
              <View style={[styles.statusBadge, item.paymentStatus === 'CAPTURED' ? styles.badgePaid : styles.badgeDeferred]}>
                <Text style={[styles.statusText, item.paymentStatus === 'CAPTURED' ? styles.textPaid : styles.textDeferred]}>
                  {item.paymentStatus === 'CAPTURED' ? 'PAID' : 'DEFERRED'}
                </Text>
              </View>
            </View>

            <Text style={styles.machineName}>{item.machineName}</Text>
            
            <View style={styles.billDetails}>
              <Text style={styles.billText}>⏱️ Hours: {item.actualHours} hrs</Text>
              <Text style={styles.billText}>₹ Rate: ₹{item.baseRatePerHour}/hr</Text>
              <Text style={styles.billText}>🚚 Transport: ₹{item.transportCharge}</Text>
            </View>

            <View style={styles.footer}>
              <Text style={styles.amount}>₹{item.finalTotalAmount.toLocaleString('en-IN')}</Text>
              
              <TouchableOpacity style={styles.shareBtn} onPress={() => handleShareInvoice(item)}>
                <Send color="#1b4d3e" size={14} />
                <Text style={styles.shareText}>{t('bookings.downloadInvoice').split('/')[0] || 'Share'}</Text>
              </TouchableOpacity>
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
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    width: '92%',
    maxWidth: 736,
    alignSelf: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  summaryVal: {
    fontSize: 18,
    fontWeight: '900',
  },
  divider: {
    width: 1,
    backgroundColor: '#cbd5e0',
    marginHorizontal: 10,
  },
  listHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 6,
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
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
  invoiceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    marginBottom: 14,
    elevation: 1,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f7fafc',
    paddingBottom: 8,
    marginBottom: 10,
  },
  invoiceNum: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  invoiceDate: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgePaid: {
    backgroundColor: '#e8f5e9',
  },
  badgeDeferred: {
    backgroundColor: '#fff8e1',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
  },
  textPaid: {
    color: '#2e7d32',
  },
  textDeferred: {
    color: '#e65100',
  },
  machineName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 8,
  },
  billDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  billText: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f7fafc',
  },
  amount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1b4d3e',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 8,
  },
  shareText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1b4d3e',
  },
});
