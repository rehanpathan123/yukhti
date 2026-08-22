import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useKisanOpsStore } from '../../src/store/kisanOpsStore';
import { t } from '../../i18n/translations';
import { globalVoiceController } from '../../src/routes/voice.routes';
import { BrowserTTSService } from '../../src/services/tts/tts.service';
import { Mic, Send, AlertCircle, Sparkles, Volume2, Calendar, CheckCircle } from 'lucide-react-native';
import { Audio } from 'expo-av';

const tts = new BrowserTTSService();

export default function AssistantScreen() {
  const router = useRouter();
  const { state, createBooking } = useKisanOpsStore();
  const { farm, machines, currentUser } = state;

  const [sessionId] = useState(`session-${Date.now()}`);
  const [conversationState, setConversationState] = useState<'IDLE' | 'LISTENING' | 'PROCESSING' | 'SEARCHING' | 'RESPONDING' | 'ERROR'>('IDLE');
  const [inputText, setInputText] = useState('');
  const [responseHtml, setResponseHtml] = useState('');
  const [transcribedText, setTranscribedText] = useState('');
  const [matchedMachines, setMatchedMachines] = useState<any[]>([]);
  const [bookingDraft, setBookingDraft] = useState<any>(null);
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stop talking when exiting screen
  useEffect(() => {
    return () => {
      tts.stop();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const getFarmerContext = () => {
    return {
      farmer_id: currentUser.id,
      farmer_name: currentUser.fullName,
      farmer_phone: currentUser.phoneNumber,
      farm_acres: farm.sizeAcres,
      location: `${farm.village}, ${farm.district}`,
      district: farm.district,
      village: farm.village,
      current_crop: farm.crop?.cropName,
      available_credit: state.agriCredit?.availableCredit,
    };
  };

  const handleProcessIntent = async (text: string) => {
    setConversationState('PROCESSING');
    if (timerRef.current) clearTimeout(timerRef.current);

    // Simulate thinking/searching delay for natural assistant experience
    timerRef.current = setTimeout(() => {
      setConversationState('SEARCHING');

      timerRef.current = setTimeout(async () => {
        try {
          const res = globalVoiceController.processText({
            text,
            sessionId,
            machines,
            context: getFarmerContext(),
            onExecuteBooking: (draft) => {
              const matchedMachine = machines.find(m => m.id === draft.machine_id);
              // Connects to actual state store booking generator
              const result = createBooking({
                farmerId: currentUser.id,
                farmerName: currentUser.fullName,
                farmerPhone: currentUser.phoneNumber,
                chcId: draft.chc_id,
                chcName: draft.chc_name,
                machineId: draft.machine_id,
                machineIdentifier: matchedMachine ? matchedMachine.identifier : 'JD-HARV-07',
                machineModel: draft.machine_model,
                machineCategory: 'HARVESTER',
                farmId: farm.id,
                farmName: farm.farmName || 'Ramesh Farm #1',
                farmLocation: `${farm.village}, ${farm.district}`,
                activity: draft.activity,
                status: 'CONFIRMED',
                bookingMode: 'HOURLY',
                bookedHours: draft.booked_hours,
                startTime: draft.target_date + 'T08:00:00.000Z',
                endTime: draft.target_date + 'T14:00:00.000Z',
                hourlyRate: draft.hourly_rate,
                estimatedTotal: draft.estimated_total,
                paymentMethod: 'AGRICREDIT_DEFERRED',
                paymentStatus: 'AUTHORIZED',
                operatorName: 'Raju Verma',
                operatorPhone: '+91 97550 12399',
              });
              return result;
            }
          });

          setTranscribedText(res.transcribed_text);
          setResponseHtml(res.assistant_response_text);
          setMatchedMachines(res.matched_machines || []);
          setBookingDraft(res.booking_draft);
          setConversationState('RESPONDING');

          if (res.created_booking) {
            setCreatedBooking(res.created_booking);
          }

          // Synthesize response speech
          await tts.speak(res.assistant_response_text);
        } catch (e) {
          console.warn('Error parsing AI intent:', e);
          setConversationState('ERROR');
        }
      }, 1200);
    }, 1000);
  };

  // Start Mic Recording
  const startRecording = async () => {
    try {
      if (permissionResponse?.status !== 'granted') {
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setConversationState('LISTENING');

      // Max 30 seconds limit auto-stop
      timerRef.current = setTimeout(() => {
        stopRecording();
      }, 30000);
    } catch (err) {
      console.error('Failed to start recording', err);
      setConversationState('ERROR');
    }
  };

  // Stop Mic Recording & Process fallback transcript
  const stopRecording = async () => {
    if (!recording) return;
    setRecording(null);
    if (timerRef.current) clearTimeout(timerRef.current);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      // Since sandbox has no active cloud speech API, fallback to default intent prompt
      // If the user's farm crop is Wheat, simulate harvesting harvester search, else default search
      const spokenQuery = farm.crop?.cropName?.toLowerCase().includes('wheat') 
        ? "भैया कल मेरे 8 एकड़ गेहूं की कटाई करनी है, सीहोर में हार्वेस्टर मिल जाएगा?"
        : "मुझे ट्रैक्टर चाहिए खेत जोतने के लिए";

      handleProcessIntent(spokenQuery);
    } catch (e) {
      setConversationState('ERROR');
    }
  };

  // Trigger Pre-baked Scenario for Hackathon demo
  const triggerDemoScenario = () => {
    setTranscribedText('');
    setResponseHtml('');
    setMatchedMachines([]);
    setBookingDraft(null);
    setCreatedBooking(null);
    tts.stop();

    setConversationState('LISTENING');
    timerRef.current = setTimeout(() => {
      // Intent: Harvest wheat, 8 acres, Sehore, Harvester
      handleProcessIntent("भैया कल मेरे 8 एकड़ गेहूं की कटाई करनी है, सीहोर में हार्वेस्टर मिल जाएगा?");
    }, 1500);
  };

  const handleConfirmDraftBooking = () => {
    // Farmer confirms the draft booking
    // Send "हाँ बुक कर दो" (Yes confirm booking) turn to intent engine
    handleProcessIntent("हाँ, बुकिंग पक्की कर दो");
  };

  const handleRejectBooking = () => {
    handleProcessIntent("नहीं, रद्द कर दो");
  };

  return (
    <View style={styles.container}>
      {/* Visual Status Indicator */}
      <View style={[styles.statusBox, styles[`statusBox${conversationState}`]]}>
        <Text style={styles.statusTitle}>
          {conversationState === 'IDLE' && t('saathi.states.IDLE')}
          {conversationState === 'LISTENING' && t('saathi.states.LISTENING')}
          {conversationState === 'PROCESSING' && t('saathi.states.PROCESSING')}
          {conversationState === 'SEARCHING' && t('saathi.states.SEARCHING')}
          {conversationState === 'RESPONDING' && t('saathi.states.RESPONDING')}
          {conversationState === 'ERROR' && t('saathi.states.ERROR')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea}>
        {/* Chat bubbles */}
        {transcribedText ? (
          <View style={styles.userBubble}>
            <Text style={styles.userBubbleLabel}>Farmer (आप)</Text>
            <Text style={styles.bubbleText}>{transcribedText}</Text>
          </View>
        ) : null}

        {responseHtml ? (
          <View style={styles.assistantBubble}>
            <View style={styles.asstTitleRow}>
              <Text style={styles.asstBubbleLabel}>{t('common.saathiName')}</Text>
              <Volume2 color="#1b4d3e" size={16} />
            </View>
            <Text style={styles.asstText}>{responseHtml}</Text>
          </View>
        ) : (
          <View style={styles.introBox}>
            <Text style={styles.introHeader}>🌾 {t('saathi.title')}</Text>
            <Text style={styles.introDesc}>
              {t('saathi.hint')}
            </Text>
          </View>
        )}

        {/* Dynamic Intent Results: Recommendations */}
        {conversationState === 'RESPONDING' && matchedMachines.length > 0 && !bookingDraft && !createdBooking ? (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsHeader}>🚜 Recommended Machines Found</Text>
            {matchedMachines.map((match, idx) => (
              <View key={idx} style={styles.machineItem}>
                <View style={styles.matchItemHeader}>
                  <Text style={styles.machineName}>{match.machine.brand} {match.machine.model}</Text>
                  <Text style={styles.matchBadge}>{match.match_score}% Fit</Text>
                </View>
                <Text style={styles.machineDetail}>📍 {match.machine.chcName} ({match.distance_km} km away)</Text>
                <Text style={styles.machinePrice}>Rate: ₹{match.price_quote.quotedRatePerHour}/hour</Text>
                
                {/* Explain reasons why */}
                <View style={styles.reasonsList}>
                  {match.reasons.map((r: string, rIdx: number) => (
                    <Text key={rIdx} style={styles.reasonTag}>✓ {r}</Text>
                  ))}
                </View>

                <TouchableOpacity style={styles.bookingActionBtn} onPress={handleConfirmDraftBooking}>
                  <Text style={styles.bookingActionText}>Confirm & Draft Booking</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}

        {/* Draft Confirmation Summary */}
        {bookingDraft && !createdBooking ? (
          <View style={styles.draftCard}>
            <Text style={styles.draftHeader}>📅 {t('machines.reviewPrice')}</Text>
            <View style={styles.draftRow}>
              <Text style={styles.draftLabel}>Machine:</Text>
              <Text style={styles.draftValue}>{bookingDraft.machine_model}</Text>
            </View>
            <View style={styles.draftRow}>
              <Text style={styles.draftLabel}>Acreage / Hours:</Text>
              <Text style={styles.draftValue}>{bookingDraft.booked_hours} Hours</Text>
            </View>
            <View style={styles.draftRow}>
              <Text style={styles.draftLabel}>Rate:</Text>
              <Text style={styles.draftValue}>₹{bookingDraft.hourly_rate}/hr</Text>
            </View>
            <View style={[styles.draftRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total (GST incl):</Text>
              <Text style={styles.totalValue}>₹{bookingDraft.estimated_total}</Text>
            </View>

            <View style={styles.draftActions}>
              <TouchableOpacity style={styles.draftRejectBtn} onPress={handleRejectBooking}>
                <Text style={styles.draftRejectText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.draftAcceptBtn} onPress={handleConfirmDraftBooking}>
                <Text style={styles.draftAcceptText}>{t('common.confirmBooking')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Booking created successfully */}
        {createdBooking ? (
          <View style={styles.successCard}>
            <CheckCircle color="#2e7d32" size={36} />
            <Text style={styles.successHeader}>{t('saathi.confirmedMessage')}</Text>
            <Text style={styles.successSub}>Booking Code: {createdBooking.bookingNumber}</Text>
            <TouchableOpacity 
              style={styles.goToTrackBtn}
              onPress={() => router.push({
                pathname: '/(farmer)/track/[bookingId]',
                params: { bookingId: createdBooking.id }
              })}
            >
              <Text style={styles.goToTrackText}>Track Dispatch Boundary</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>

      {/* Text fallback input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder={t('home.writeFallback')}
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => {
            if (inputText.trim()) {
              handleProcessIntent(inputText);
              setInputText('');
            }
          }}
        >
          <Send color="#ffffff" size={18} />
        </TouchableOpacity>
      </View>

      {/* Mic Trigger / Demo Bar */}
      <View style={styles.controlsRow}>
        <TouchableOpacity 
          style={styles.demoScenarioBtn} 
          onPress={triggerDemoScenario}
        >
          <Sparkles color="#ffd700" size={18} />
          <Text style={styles.demoScenarioText}>⚡ Hackathon Demo Mode</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.micBtn, recording && styles.micBtnRecording]}
          onPressIn={startRecording}
          onPressOut={stopRecording}
        >
          <Mic color="#ffffff" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F8F3', // Warm off-white
  },
  statusBox: {
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#cbd5e0',
    backgroundColor: '#ffffff',
  },
  statusBoxIDLE: {
    backgroundColor: '#ffffff',
  },
  statusBoxLISTENING: {
    backgroundColor: '#ffebee',
    borderColor: '#ffcdd2',
  },
  statusBoxPROCESSING: {
    backgroundColor: '#e8f0fe',
    borderColor: '#d2e3fc',
  },
  statusBoxSEARCHING: {
    backgroundColor: '#fff8e1',
    borderColor: '#ffe082',
  },
  statusBoxRESPONDING: {
    backgroundColor: '#e8f5e9',
    borderColor: '#c8e6c9',
  },
  statusBoxERROR: {
    backgroundColor: '#fce8e6',
    borderColor: '#fad2cf',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  scrollArea: {
    padding: 20,
    flexGrow: 1,
    paddingBottom: 100,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#1b4d3e',
    borderRadius: 18,
    borderTopRightRadius: 2,
    padding: 12,
    maxWidth: '80%',
    marginBottom: 16,
  },
  userBubbleLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#a3cfbb',
    marginBottom: 4,
  },
  bubbleText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderTopLeftRadius: 2,
    padding: 14,
    maxWidth: '85%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    elevation: 1,
  },
  asstTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  asstBubbleLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1b4d3e',
  },
  asstText: {
    fontSize: 14,
    color: '#2d3748',
    fontWeight: '700',
    lineHeight: 20,
  },
  introBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    paddingHorizontal: 20,
  },
  introHeader: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1b4d3e',
  },
  introDesc: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    fontWeight: '600',
  },
  resultsContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  resultsHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 12,
  },
  machineItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f7fafc',
    paddingVertical: 12,
  },
  matchItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  machineName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  matchBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#e69b00',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  machineDetail: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  machinePrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1b4d3e',
    marginTop: 4,
  },
  reasonsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 8,
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
  bookingActionBtn: {
    backgroundColor: '#1b4d3e',
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  bookingActionText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  draftCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e69b00',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  draftHeader: {
    fontSize: 14,
    fontWeight: '900',
    color: '#e69b00',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  draftRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f7fafc',
  },
  draftLabel: {
    fontSize: 13,
    color: '#4a5568',
    fontWeight: '600',
  },
  draftValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1b4d3e',
  },
  draftActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  draftRejectBtn: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  draftRejectText: {
    color: '#718096',
    fontWeight: 'bold',
  },
  draftAcceptBtn: {
    flex: 1.5,
    height: 44,
    backgroundColor: '#e69b00',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  draftAcceptText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  successCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a3cfbb',
    elevation: 1,
    marginTop: 10,
  },
  successHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 12,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
    fontWeight: 'bold',
  },
  goToTrackBtn: {
    backgroundColor: '#1b4d3e',
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  goToTrackText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  inputBar: {
    position: 'absolute',
    bottom: 84,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    paddingHorizontal: 12,
    height: 52,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1a202c',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#1b4d3e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsRow: {
    position: 'absolute',
    bottom: 12,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  demoScenarioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1b4d3e',
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#2e7d66',
    elevation: 3,
  },
  demoScenarioText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  micBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e69b00',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
  },
  micBtnRecording: {
    backgroundColor: '#c62828',
    transform: [{ scale: 1.1 }],
  },
});
