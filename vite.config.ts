import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { viteRazorpayPlugin } from './server/viteRazorpayPlugin.ts';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Populate process.env with loaded env vars for server middleware
  process.env.RAZORPAY_KEY_ID = env.RAZORPAY_KEY_ID || env.VITE_RAZORPAY_KEY_ID;
  process.env.RAZORPAY_KEY_SECRET = env.RAZORPAY_KEY_SECRET;
  process.env.VITE_RAZORPAY_KEY_ID = env.VITE_RAZORPAY_KEY_ID || env.RAZORPAY_KEY_ID;

  return {
    plugins: [react(), viteRazorpayPlugin()],
    define: {
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'process.env.VITE_RAZORPAY_KEY_ID': JSON.stringify(env.VITE_RAZORPAY_KEY_ID),
      'process.env.VITE_GROQ_API_KEY': JSON.stringify(env.VITE_GROQ_API_KEY),
    },
    // Ensure SPA fallback works for all routes during dev
    appType: 'spa',
    optimizeDeps: {
      exclude: [
        'react-native',
        'react-native-maps',
        'expo',
        'expo-router',
        'expo-speech',
        'expo-av',
        'expo-file-system',
        'expo-image',
        'expo-location',
        'expo-localization',
        'expo-secure-store',
        'expo-notifications'
      ]
    },
    build: {
      rollupOptions: {
        external: [
          'react-native',
          'react-native-maps',
          'react-native-safe-area-context',
          'react-native-screens',
          'expo',
          'expo-router',
          'expo-speech',
          'expo-av',
          'expo-file-system',
          'expo-image',
          'expo-location',
          'expo-localization',
          'expo-secure-store',
          'expo-notifications',
          'expo-constants',
          'expo-linking',
          'expo-status-bar',
          'expo-system-ui',
          '@expo/metro-runtime'
        ]
      }
    }
  };
});
