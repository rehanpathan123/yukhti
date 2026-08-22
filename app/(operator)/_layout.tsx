import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Navigation, Tractor, Gauge, LogOut } from 'lucide-react-native';
import { TouchableOpacity, Text } from 'react-native';
import { useKisanOpsStore } from '../../src/store/kisanOpsStore';

export default function OperatorLayout() {
  const { logoutUser } = useKisanOpsStore();
  const router = useRouter();

  const handleLogout = () => {
    logoutUser();
    router.replace('/(auth)/login');
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1b4d3e',
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
          elevation: 3,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: '900',
          fontSize: 18,
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 14,
              marginRight: 16,
              gap: 6,
            }}
          >
            <LogOut color="#ffffff" size={16} />
            <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>Switch</Text>
          </TouchableOpacity>
        ),
        sceneStyle: {
          backgroundColor: '#F9F8F3',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Operator Cockpit',
          tabBarLabel: 'Active Jobs',
          tabBarIcon: ({ color, size }) => <Navigation color={color} size={size + 2} />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="fleet"
        options={{
          title: 'Machine Telematics',
          tabBarLabel: 'Diagnostics',
          tabBarIcon: ({ color, size }) => <Gauge color={color} size={size + 2} />,
          headerShown: true,
        }}
      />
    </Tabs>
  );
}
