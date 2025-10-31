import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import ShareWalkModal from './ShareWalkModal';

const WalkCard = ({ walk, onPress, onShare, onDelete }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [showShareModal, setShowShareModal] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}h`;
    }
    return `${minutes}m`;
  };

  const formatDistance = (meters) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const getPOIIcon = (type) => {
    switch (type) {
      case 'park':
        return 'leaf';
      case 'water':
        return 'water';
      case 'vet':
        return 'medical';
      case 'pet_store':
        return 'storefront';
      case 'groomer':
        return 'cut';
      case 'boarding':
        return 'home';
      default:
        return 'location';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={() => onPress(walk)}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {walk.title || `${t('walks.walk_with')} ${walk.pet?.name || t('common.your_pet')}`}
          </Text>
          <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
            {formatDate(walk.startTime)}
          </Text>
        </View>
        
        {walk.isAutoCompleted && (
          <View style={[styles.autoBadge, { backgroundColor: theme.colors.primaryContainer }]}>
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
            <Text style={[styles.autoText, { color: theme.colors.onPrimaryContainer }]}>
              {t('walks.auto_completed')}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Ionicons name="walk" size={20} color={theme.colors.primary} />
          <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
            {formatDistance(walk.distance)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('walks.distance')}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="time" size={20} color={theme.colors.primary} />
          <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
            {formatDuration(walk.duration)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('walks.duration')}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="location" size={20} color={theme.colors.primary} />
          <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
            {walk.pois?.length || 0}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('walks.pois')}
          </Text>
        </View>
      </View>

      {walk.pois && walk.pois.length > 0 && (
        <View style={styles.poisContainer}>
          <Text style={[styles.poisTitle, { color: theme.colors.onSurfaceVariant }]}>
            {t('walks.visited_pois')}:
          </Text>
          <View style={styles.poisList}>
            {walk.pois.slice(0, 3).map((poi, index) => (
              <View key={index} style={styles.poiItem}>
                <Ionicons 
                  name={getPOIIcon(poi.type)} 
                  size={16} 
                  color={theme.colors.primary} 
                />
                <Text style={[styles.poiName, { color: theme.colors.onSurface }]}>
                  {poi.name}
                </Text>
              </View>
            ))}
            {walk.pois.length > 3 && (
              <Text style={[styles.morePois, { color: theme.colors.onSurfaceVariant }]}>
                +{walk.pois.length - 3} {t('walks.more')}
              </Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: theme.colors.outline }]}
          onPress={() => setShowShareModal(true)}
        >
          <Ionicons name="share" size={20} color={theme.colors.onSurface} />
          <Text style={[styles.actionText, { color: theme.colors.onSurface }]}>
            {t('walks.share')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: theme.colors.error }]}
          onPress={() => onDelete(walk)}
        >
          <Ionicons name="trash" size={20} color={theme.colors.error} />
          <Text style={[styles.actionText, { color: theme.colors.error }]}>
            {t('common.delete')}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ShareWalkModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        walk={walk}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
  },
  autoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  autoText: {
    fontSize: 12,
    marginLeft: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  poisContainer: {
    marginBottom: 16,
  },
  poisTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  poisList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  poiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  poiName: {
    fontSize: 12,
    marginLeft: 4,
  },
  morePois: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 14,
    marginLeft: 6,
  },
});

export default WalkCard;