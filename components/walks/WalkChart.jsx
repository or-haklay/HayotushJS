import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

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
    <View style={styles.container}>
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

      {/* Progress Indicators */}
      <View style={styles.progressContainer}>
        <Text style={[styles.progressTitle, { color: theme.colors.onSurface }]}>
          {t('walks.weekly_progress')}
        </Text>
        
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { 
            backgroundColor: theme.colors.primary,
            width: `${Math.min((totalWalks / 7) * 100, 100)}%`
          }]} />
        </View>
        
        <Text style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
          {totalWalks} / 7 {t('walks.walks_this_week')}
        </Text>
      </View>
    </View>
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
});

export default WalkChart;

