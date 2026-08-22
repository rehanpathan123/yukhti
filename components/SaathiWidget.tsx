import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Mic } from 'lucide-react-native';

export function SaathiWidget() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.floatingWidget}
      onPress={() => router.push('/(farmer)/assistant')}
      activeOpacity={0.8}
    >
      <Mic color="#ffffff" size={20} />
      <Text style={styles.widgetText}>Saathi</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingWidget: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#e69b00', // Gold/Amber accent
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    gap: 6,
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1000,
  },
  widgetText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
