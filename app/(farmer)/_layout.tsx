import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Tractor, Calendar, User } from 'lucide-react-native';
import { t, getLanguage } from '../../i18n/translations';

export default function FarmerLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1b4d3e', // Agricultural Green
        tabBarInactiveTintColor: '#718096',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
        headerStyle: {
          backgroundColor: '#1b4d3e',
          elevation: 2,
          shadowOpacity: 0.1,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        sceneStyle: {
          backgroundColor: '#F9F8F3', // Warm off-white
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('common.appName'),
          tabBarLabel: getLanguage() === 'hi' ? 'होम' : 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size + 2} />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="machines/index"
        options={{
          title: t('home.findMachine'),
          tabBarLabel: getLanguage() === 'hi' ? 'मशीनें' : 'Machines',
          tabBarIcon: ({ color, size }) => <Tractor color={color} size={size + 2} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="bookings/index"
        options={{
          title: t('home.myBookings'),
          tabBarLabel: getLanguage() === 'hi' ? 'बुकिंग' : 'Bookings',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size + 2} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: t('common.saathiName'),
          tabBarLabel: getLanguage() === 'hi' ? 'प्रोफ़ाइल' : 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size + 2} />,
          headerShown: false,
        }}
      />
      
      {/* Hidden Screens inside directories that expo-router auto-maps */}
      <Tabs.Screen
        name="assistant"
        options={{
          href: null,
          title: t('common.saathiName'),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="track/[bookingId]"
        options={{
          href: null,
          title: t('bookings.track'),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="payments/index"
        options={{
          href: null,
          title: t('home.payments'),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile/farm"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings/language"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="machines/[id]"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
