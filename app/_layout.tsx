import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useKisanOpsStore } from '../src/store/kisanOpsStore';
import { ActivityIndicator, View } from 'react-native';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#1b4d3e" />
        <AppNavigator />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

function AppNavigator() {
  const { state } = useKisanOpsStore();
  const segments = useSegments();
  const router = useRouter();

  const isInitialLoading = state.isInitialLoading;
  const isLoggedIn = !!state.currentUser?.phoneNumber;
  const userRole = state.currentUser?.role || 'FARMER';
  const isFarmer = userRole === 'FARMER';
  const isFarmConfigured = state.farm?.sizeAcres > 0 && !!state.farm?.district;

  useEffect(() => {
    if (isInitialLoading) return;

    const segs = segments as any;
    const inAuthGroup = segs[0] === '(auth)';
    const currentGroup = segs[0];

    if (!isLoggedIn) {
      // Redirect to login if not authenticated
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else if (isFarmer && !isFarmConfigured) {
      // Force onboarding only for farmers if farm profile is empty
      if (segs[1] !== 'onboarding') {
        router.replace('/(auth)/onboarding');
      }
    } else {
      // Logged in -> route to the respective role's dedicated workspace
      if (userRole === 'CHC_MANAGER') {
        if (currentGroup !== '(chc)') {
          router.replace('/(chc)');
        }
      } else if (userRole === 'OPERATOR') {
        if (currentGroup !== '(operator)') {
          router.replace('/(operator)');
        }
      } else {
        // Farmer
        if (currentGroup !== '(farmer)' && (inAuthGroup || segs.length === 0)) {
          router.replace('/(farmer)');
        }
      }
    }
  }, [isLoggedIn, isFarmConfigured, isFarmer, userRole, isInitialLoading, segments]);

  if (isInitialLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F9F8F3', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1b4d3e" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1b4d3e',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: '#F9F8F3', // Warm off-white
        },
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(farmer)" options={{ headerShown: false }} />
      <Stack.Screen name="(chc)" options={{ headerShown: false }} />
      <Stack.Screen name="(operator)" options={{ headerShown: false }} />
    </Stack>
  );
}

