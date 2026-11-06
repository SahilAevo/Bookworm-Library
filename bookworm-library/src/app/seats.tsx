import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { DashboardTheme } from '@/constants/dashboard-theme';
import { useThemeMode } from '@/context/ThemeContext';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopNavbar } from '@/components/dashboard/TopNavbar';
import { SeatManagementView } from '@/components/dashboard/SeatManagementView';

export default function SeatsScreen() {
  const { width } = useWindowDimensions();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { colors } = useThemeMode();

  const isDesktop = width >= 1024;
  const isMobile = width < 768;

  const handleNavigate = (route: string) => {
    if (route === 'overview') {
      router.push('/');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.surface.canvas }]} edges={['top', 'left', 'right']}>
      <View style={[styles.appContainer, { backgroundColor: colors.surface.canvas }]}>
        {/* Sidebar */}
        {isDesktop ? (
          <Sidebar currentRoute="seats" onNavigate={handleNavigate} />
        ) : (
          <Sidebar
            currentRoute="seats"
            onNavigate={handleNavigate}
            isMobileOpen={isMobileMenuOpen}
            onMobileClose={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Content Area */}
        <View style={[styles.mainContentArea, { backgroundColor: colors.surface.canvas }]}>
          <TopNavbar
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onNotificationPress={() => {}}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContainer,
              isMobile && styles.scrollContainerMobile,
            ]}>
            <SeatManagementView onBackToDashboard={() => router.push('/')} />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const { colors } = DashboardTheme;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface.canvas,
  },
  appContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.surface.canvas,
  },
  mainContentArea: {
    flex: 1,
    backgroundColor: colors.surface.canvas,
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 48,
    maxWidth: 1600,
    width: '100%',
    alignSelf: 'center',
  },
  scrollContainerMobile: {
    padding: 16,
    paddingBottom: 36,
  },
});

