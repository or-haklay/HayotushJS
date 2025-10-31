import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useWalk } from '../../context/WalkContext';
import WalkChart from '../../components/walks/WalkChart';

const WalkStatsScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { petId } = useLocalSearchParams();
  
  const {
    walks,
    isLoadingWalks,
    errorLoadingWalks,
    loadWalks,
  } = useWalk();

  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    if (petId) {
      loadWalks(petId);
    }
  }, [petId]);

  const getFilteredWalks = () => {
    if (!walks || walks.length === 0) return [];
    
    const now = new Date();
    const filterDate = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return walks;
    }
    
    return walks.filter(walk => new Date(walk.startTime) >= filterDate);
  };

  const filteredWalks = getFilteredWalks();

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleExportStats = () => {
    Alert.alert(t('walks.export_stats'), t('walks.export_coming_soon'));
  };

  const handleShareStats = () => {
    Alert.alert(t('walks.share_stats'), t('walks.share_coming_soon'));
  };

  if (isLoadingWalks) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
          {t('walks.loading_stats')}
        </Text>
      </SafeAreaView>
    );
  }

  if (errorLoadingWalks) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
        <Text style={[styles.errorTitle, { color: theme.colors.onSurface }]}>
          {t('walks.error_loading_stats')}
        </Text>
        <Text style={[styles.errorSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          {errorLoadingWalks}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => loadWalks(petId)}
        >
          <Ionicons name="refresh" size={24} color={theme.colors.onPrimary} />
          <Text style={[styles.retryButtonText, { color: theme.colors.onPrimary }]}>
            {t('common.retry')}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          {t('walks.stats')}
        </Text>
        
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {
            Alert.alert(
              t('walks.options'),
              '',
              [
                { text: t('walks.export_stats'), onPress: handleExportStats },
                { text: t('walks.share_stats'), onPress: handleShareStats },
                { text: t('common.cancel'), style: 'cancel' },
              ]
            );
          }}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={[styles.periodSelector, { backgroundColor: theme.colors.surface }]}>
        {['week', 'month', 'year'].map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              {
                backgroundColor: selectedPeriod === period 
                  ? theme.colors.primary 
                  : 'transparent',
                borderColor: theme.colors.outline,
              }
            ]}
            onPress={() => handlePeriodChange(period)}
          >
            <Text
              style={[
                styles.periodButtonText,
                {
                  color: selectedPeriod === period 
                    ? theme.colors.onPrimary 
                    : theme.colors.onSurface,
                }
              ]}
            >
              {t(`walks.period.${period}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        <WalkChart walks={filteredWalks} period={selectedPeriod} />
        
        {/* Additional Stats */}
        {filteredWalks.length > 0 && (
          <View style={[styles.additionalStats, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {t('walks.additional_insights')}
            </Text>
            
            <View style={styles.insightItem}>
              <Ionicons name="trending-up" size={20} color={theme.colors.primary} />
              <Text style={[styles.insightText, { color: theme.colors.onSurface }]}>
                {t('walks.longest_streak')}: {getLongestStreak(filteredWalks)} {t('walks.days')}
              </Text>
            </View>
            
            <View style={styles.insightItem}>
              <Ionicons name="calendar" size={20} color={theme.colors.primary} />
              <Text style={[styles.insightText, { color: theme.colors.onSurface }]}>
                {t('walks.most_active_day')}: {getMostActiveDay(filteredWalks)}
              </Text>
            </View>
            
            <View style={styles.insightItem}>
              <Ionicons name="time" size={20} color={theme.colors.primary} />
              <Text style={[styles.insightText, { color: theme.colors.onSurface }]}>
                {t('walks.preferred_time')}: {getPreferredTime(filteredWalks)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper functions
const getLongestStreak = (walks) => {
  if (walks.length === 0) return 0;
  
  const sortedWalks = walks.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  let maxStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sortedWalks.length; i++) {
    const prevDate = new Date(sortedWalks[i - 1].startTime);
    const currDate = new Date(sortedWalks[i].startTime);
    const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  return maxStreak;
};

const getMostActiveDay = (walks) => {
  if (walks.length === 0) return t('walks.no_data');
  
  const dayCount = {};
  walks.forEach(walk => {
    const day = new Date(walk.startTime).toLocaleDateString('he-IL', { weekday: 'long' });
    dayCount[day] = (dayCount[day] || 0) + 1;
  });
  
  return Object.keys(dayCount).reduce((a, b) => dayCount[a] > dayCount[b] ? a : b);
};

const getPreferredTime = (walks) => {
  if (walks.length === 0) return t('walks.no_data');
  
  const timeCount = {};
  walks.forEach(walk => {
    const hour = new Date(walk.startTime).getHours();
    const timeSlot = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    timeCount[timeSlot] = (timeCount[timeSlot] || 0) + 1;
  });
  
  const preferredTime = Object.keys(timeCount).reduce((a, b) => timeCount[a] > timeCount[b] ? a : b);
  return t(`walks.time_slots.${preferredTime}`);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  menuButton: {
    padding: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  additionalStats: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default WalkStatsScreen;

