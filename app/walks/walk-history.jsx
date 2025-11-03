import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

import { useWalk } from '../../context/WalkContext';

const statusBarHeight = Constants.statusBarHeight || 0;
import WalkCard from '../../components/walks/WalkCard';
import walkService from '../../services/walkService';

const WalkHistoryScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { petId } = useLocalSearchParams();
  
  const {
    walks,
    isLoadingWalks,
    errorLoadingWalks,
    isRefreshing,
    loadWalks,
    refreshWalks,
  } = useWalk();

  const [selectedPet, setSelectedPet] = useState(null);
  const [localWalks, setLocalWalks] = useState([]);
  const [isLoadingLocal, setIsLoadingLocal] = useState(true);

  useEffect(() => {
    loadAllWalks();
  }, []);

  const loadAllWalks = async () => {
    try {
      setIsLoadingLocal(true);
      const allWalks = await walkService.getAllWalks();
      setLocalWalks(allWalks.reverse()); // Most recent first
    } catch (error) {
      console.error('Error loading all walks:', error);
    } finally {
      setIsLoadingLocal(false);
    }
  };

  const handleWalkPress = (walk) => {
    router.push({
      pathname: '/walks/walk-details',
      params: { walkId: walk._id },
    });
  };

  const handleDeleteWalk = async (walk) => {
    Alert.alert(
      t('walks.delete_walk'),
      t('walks.delete_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await walkService.deleteWalk(walk._id);
              // Refresh the list
              await loadAllWalks();
            } catch (error) {
              console.error('Error deleting walk:', error);
              Alert.alert(t('walks.error'), t('walks.delete_error'));
            }
          },
        },
      ]
    );
  };

  const handleRefresh = async () => {
    await loadAllWalks();
  };

  const renderWalkCard = ({ item }) => (
    <WalkCard
      walk={item}
      onPress={handleWalkPress}
      onShare={() => {}} // WalkCard handles share internally
      onDelete={handleDeleteWalk}
    />
  );

  const renderEmptyState = () => (
    <View style={[styles.emptyState, { backgroundColor: theme.colors.background }]}>
      <Ionicons name="walk" size={64} color={theme.colors.outline} />
      <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
        {t('walks.no_walks_yet')}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
        {t('walks.start_walking_message')}
      </Text>
      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push('/(tabs)/walks')}
      >
        <Ionicons name="play" size={24} color={theme.colors.onPrimary} />
        <Text style={[styles.startButtonText, { color: theme.colors.onPrimary }]}>
          {t('walks.start_first_walk')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View style={[styles.errorState, { backgroundColor: theme.colors.background }]}>
      <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
      <Text style={[styles.errorTitle, { color: theme.colors.onSurface }]}>
        {t('walks.error_loading')}
      </Text>
      <Text style={[styles.errorSubtitle, { color: theme.colors.onSurfaceVariant }]}>
        {errorLoadingWalks}
      </Text>
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleRefresh}
      >
        <Ionicons name="refresh" size={24} color={theme.colors.onPrimary} />
        <Text style={[styles.retryButtonText, { color: theme.colors.onPrimary }]}>
          {t('common.retry')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Use localWalks instead of walks from context
  const displayWalks = localWalks.length > 0 ? localWalks : walks;

  if (!isLoadingLocal && !isLoadingWalks && displayWalks.length === 0) {
    // Show empty state immediately instead of loading
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {renderEmptyState()}
      </SafeAreaView>
    );
  }

  if ((isLoadingLocal || isLoadingWalks) && displayWalks.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
          {t('walks.loading_walks')}
        </Text>
      </SafeAreaView>
    );
  }

  if (errorLoadingWalks) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {renderError()}
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
          {t('walks.history')}
        </Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/walks/walk-stats')}
          >
            <Ionicons name="stats-chart" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              // TODO: Implement filter functionality
              Alert.alert(t('walks.filter'), t('walks.filter_coming_soon'));
            }}
          >
            <Ionicons name="filter" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={displayWalks.length === 0 ? styles.emptyContainer : styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || isLoadingLocal}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={true}
      >
        {displayWalks.length === 0 ? (
          renderEmptyState()
        ) : (
          displayWalks.map((walk) => (
            <View key={walk._id}>
              {renderWalkCard({ item: walk })}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
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
    paddingTop: 12 + statusBarHeight,
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
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});

export default WalkHistoryScreen;

