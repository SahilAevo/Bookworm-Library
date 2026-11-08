import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl =
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    'https://nomhtbuxswcvxyojaeph.supabase.co';

const supabaseKey =
    process.env.EXPO_PUBLIC_SUPABASE_KEY ||
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    'sb_publishable_HQ8Mje-Csg6YHinuuXEjNQ_a97Fatmw';

// In Expo Static Rendering (Node.js), window does not exist.
// This safe storage adapter prevents "ReferenceError: window is not defined" during SSR.
const isServer = Platform.OS === 'web' && typeof window === 'undefined';

const safeStorage = {
    getItem: (key: string): Promise<string | null> => {
        if (isServer) return Promise.resolve(null);
        return AsyncStorage.getItem(key);
    },
    setItem: (key: string, value: string): Promise<void> => {
        if (isServer) return Promise.resolve();
        return AsyncStorage.setItem(key, value);
    },
    removeItem: (key: string): Promise<void> => {
        if (isServer) return Promise.resolve();
        return AsyncStorage.removeItem(key);
    },
};

export const supabase = createClient(
    supabaseUrl,
    supabaseKey,
    {
        auth: {
            storage: safeStorage,
            autoRefreshToken: !isServer,
            persistSession: !isServer,
            detectSessionInUrl: false,
        },
    }
);
