import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');
const screenWidth = width - 64; // Account for padding

const WalkChart = ({ walks, period = 'week' }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Calculate statistics
  const totalWalks = walks.length;
  const totalDistance = walks.reduce((sum, walk) => sum + (walk.distance || 0), 0);
  const totalDuration = walks.reduce((sum, walk) => sum + (walk.duration || 0), 0);
  const totalPOIs = walks.reduce((sum, walk) => sum + (walk.pois?.length || 0), 0);
  
  const averageDistance = totalWalks > 0 ? totalDistance / totalWalks : 0;
  const averageDuration = totalWalks > 0 ? totalDuration / totalWalks : 0;
  const averagePOIs = totalWalks > 0 ? totalPOIs / totalWalks : 0;

  // Find best walk
  const bestWalk = walks.reduce((best, walk) => {
    if (!best) return walk;
    return walk.distance > best.distance ? walk : best;
  }, null);

  // Calculate weekly data (7 days)
  const weeklyData = useMemo(() => {
    const now = new Date();
    const days = [];
    const dayNames = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Find walks for this day
      const dayWalks = walks.filter(walk => {
        const walkDate = new Date(walk.startTime);
        return walkDate >= date && walkDate <= endOfDay;
      });
      
      const totalDistance = dayWalks.reduce((sum, walk) => sum + (walk.distance || 0), 0);
      
      days.push({
        dayName: dayNames[date.getDay()],
        date: date,
        distance: totalDistance,
        walkCount: dayWalks.length,
      });
    }
    
    return days;
  }, [walks]);

  // Calculate streak (consecutive days with walks)
  const streakData = useMemo(() => {
    if (!walks || walks.length === 0) return { currentStreak: 0, longestStreak: 0 };
    
    // Get unique days with walks
    const daysWithWalks = new Set();
    walks.forEach(walk => {
      const walkDate = new Date(walk.startTime);
      walkDate.setHours(0, 0, 0, 0);
      daysWithWalks.add(walkDate.getTime());
    });
    
    // Sort dates
    const sortedDays = Array.from(daysWithWalks).sort((a, b) => a - b);
    
    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    
    // Current streak (from today backwards)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = new Date(today);
    
    for (let i = 0; i < 30; i++) {
      const dateKey = checkDate.getTime();
      if (daysWithWalks.has(dateKey)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    // Longest streak
    for (let i = 1; i < sortedDays.length; i++) {
      const prevDate = new Date(sortedDays[i - 1]);
      const currDate = new Date(sortedDays[i]);
      const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
    
    return { currentStreak, longestStreak };
  }, [walks]);

  const formatDistance = (meters) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}h`;
    }
    return `${minutes}m`;
  };

  const StatCard = ({ icon, title, value, subtitle, color = theme.colors.primary }) => (
    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.statTitle, { color: theme.colors.onSurfaceVariant }]}>
        {title}
      </Text>
      <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
        {value}
      </Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );

  if (totalWalks === 0) {
    return (
      <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
        <Ionicons name="bar-chart" size={48} color={theme.colors.outline} />
        <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
          {t('walks.no_stats_yet')}
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
          {t('walks.start_walking_for_stats')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Summary Stats */}
      <View style={styles.summaryRow}>
        <StatCard
          icon="walk"
          title={t('walks.total_walks')}
          value={totalWalks}
          color="#4CAF50"
        />
        <StatCard
          icon="location"
          title={t('walks.total_distance')}
          value={formatDistance(totalDistance)}
          color="#2196F3"
        />
      </View>

      <View style={styles.summaryRow}>
        <StatCard
          icon="time"
          title={t('walks.total_time')}
          value={formatDuration(totalDuration)}
          color="#FF9800"
        />
        <StatCard
          icon="map"
          title={t('walks.total_pois')}
          value={totalPOIs}
          color="#9C27B0"
        />
      </View>

      {/* Average Stats */}
      <View style={styles.averageRow}>
        <StatCard
          icon="trending-up"
          title={t('walks.average_distance')}
          value={formatDistance(averageDistance)}
          subtitle={t('walks.per_walk')}
          color="#4CAF50"
        />
        <StatCard
          icon="timer"
          title={t('walks.average_duration')}
          value={formatDuration(averageDuration)}
          subtitle={t('walks.per_walk')}
          color="#FF9800"
        />
      </View>

      {/* Best Walk */}
      {bestWalk && (
        <View style={[styles.bestWalkCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.bestWalkHeader}>
            <Ionicons name="trophy" size={24} color="#FFD700" />
            <Text style={[styles.bestWalkTitle, { color: theme.colors.onSurface }]}>
              {t('walks.best_walk')}
            </Text>
          </View>
          
          <View style={styles.bestWalkStats}>
            <View style={styles.bestWalkStat}>
              <Text style={[styles.bestWalkValue, { color: theme.colors.onSurface }]}>
                {formatDistance(bestWalk.distance)}
              </Text>
              <Text style={[styles.bestWalkLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('walks.distance')}
              </Text>
            </View>
            
            <View style={styles.bestWalkStat}>
              <Text style={[styles.bestWalkValue, { color: theme.colors.onSurface }]}>
                {formatDuration(bestWalk.duration)}
              </Text>
              <Text style={[styles.bestWalkLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('walks.duration')}
              </Text>
            </View>
            
            <View style={styles.bestWalkStat}>
              <Text style={[styles.bestWalkValue, { color: theme.colors.onSurface }]}>
                {bestWalk.pois?.length || 0}
              </Text>
              <Text style={[styles.bestWalkLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('walks.pois')}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.bestWalkDate, { color: theme.colors.onSurfaceVariant }]}>
            {new Date(bestWalk.startTime).toLocaleDateString('he-IL')}
          </Text>
        </View>
      )}

      {/* Weekly Chart - Show only for week period */}
      {period === 'week' && weeklyData && weeklyData.length > 0 ? (
        <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.chartTitle, { color: theme.colors.onSurface }]}>
            {t('walks.weekly_chart')}
          </Text>
          <LineChart
            data={{
              labels: weeklyData.map(d => d.dayName),
              datasets: [{
                data: weeklyData.map(d => Math.round(d.distance)), // Show in meters
                color: (opacity = 1) =>
                  theme.colors.primary +
                  Math.floor(opacity * 255)
                    .toString(16)
                    .padStart(2, '0'),
                strokeWidth: 2,
              }],
            }}
            width={screenWidth}
            height={220}
            chartConfig={{
              decimalPlaces: 0,
              backgroundGradientFromOpacity: 0,
              backgroundGradientToOpacity: 0,
              color: (opacity = 1) =>
                theme.colors.primary +
                Math.floor(opacity * 255)
                  .toString(16)
                  .padStart(2, '0'),
              labelColor: (opacity = 1) =>
                theme.colors.onSurfaceVariant +
                Math.floor(opacity * 255)
                  .toString(16)
                  .padStart(2, '0'),
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: theme.colors.primary,
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
              backgroundColor: 'transparent',
            }}
          />
        </View>
      ) : period === 'week' ? (
        <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.chartTitle, { color: theme.colors.onSurface }]}>
            {t('walks.weekly_chart')}
          </Text>
          <View style={styles.emptyChartState}>
            <Ionicons name="bar-chart-outline" size={48} color={theme.colors.outline} />
            <Text style={[styles.emptyChartText, { color: theme.colors.onSurfaceVariant }]}>
              {t('walks.no_data')}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Streak Indicator */}
      <View style={[styles.streakContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.streakTitle, { color: theme.colors.onSurface }]}>
          {t('walks.streak')}
        </Text>
        
        <View style={styles.streakStats}>
          <View style={styles.streakStat}>
            <Text style={[styles.streakValue, { color: theme.colors.primary }]}>
              {streakData.currentStreak}
            </Text>
            <Text style={[styles.streakLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('walks.current_streak')}
            </Text>
          </View>
          <View style={styles.streakStat}>
            <Text style={[styles.streakValue, { color: '#FFD700' }]}>
              {streakData.longestStreak}
            </Text>
            <Text style={[styles.streakLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('walks.longest_streak')}
            </Text>
          </View>
        </View>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  averageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 10,
    textAlign: 'center',
  },
  bestWalkCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bestWalkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bestWalkTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  bestWalkStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  bestWalkStat: {
    alignItems: 'center',
  },
  bestWalkValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bestWalkLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  bestWalkDate: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 12,
    margin: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  chartContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  streakContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  streakStat: {
    alignItems: 'center',
  },
  streakValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyChartState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyChartText: {
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default WalkChart;

