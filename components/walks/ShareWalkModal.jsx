import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
  Dimensions,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import walkService from '../../services/walkService';

const { width } = Dimensions.get('window');

const ShareWalkModal = ({ visible, onClose, walk }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const [isSharing, setIsSharing] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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

  const handleShareLink = async () => {
    if (!walk) return;
    
    // Show warning that walk will be public
    Alert.alert(
      t('walks.share_walk'),
      t('walks.share_warning'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('walks.share'),
          style: 'default',
          onPress: async () => {
            setIsSharing(true);
            
            try {
              // First, sync walk to server to get server ID
              let walkIdToUse = walk._id;
              try {
                const syncedId = await walkService.syncWalkToServer(walk._id);
                walkIdToUse = syncedId;
                console.log('✅ Walk synced to server, using ID:', walkIdToUse);
              } catch (syncError) {
                console.warn('⚠️ Failed to sync walk to server, using local ID:', syncError.message);
                // Continue with local ID
              }
              
              // Update walk to be shared
              await walkService.updateWalkShareStatus(walkIdToUse, true);
              
              // Generate shareable link - ensure _id is string
              const walkId = String(walkIdToUse || walk._id || walk.id || '');
              console.log('🔗 Sharing walk with ID:', walkId, 'Full walk:', walk);
              
              if (!walkId || walkId === 'undefined' || walkId === 'null') {
                throw new Error('Walk ID not found or invalid');
              }
              
              const shareLink = `https://hayotush.com/walk/${walkId}`;
              console.log('📤 Generated share link:', shareLink);
              
              const shareMessage = `${t('walks.share_walk_message')} ${walk.title || `${t('walks.walk_with')} ${walk.pet?.name}`}\n\n${t('walks.distance')}: ${formatDistance(walk.distance)}\n${t('walks.duration')}: ${formatDuration(walk.duration)}\n${t('walks.pois')}: ${walk.pois?.length || 0}\n\n${t('walks.view_walk')}: ${shareLink}`;
              
              // Share the link
              const result = await Share.share({
                message: shareMessage,
                url: shareLink,
                title: walk.title || `${t('walks.walk_with')} ${walk.pet?.name}`,
              });
              
              // Note: On iOS, result.action can be 'sharedAction' or 'dismissedAction'
              // On Android, result is undefined if user cancels
              if (result && result.action !== 'dismissedAction') {
                console.log('Walk shared successfully:', shareLink);
              }
            } catch (error) {
              console.error('Error sharing link:', error);
              Alert.alert(t('walks.error'), t('walks.share_link_error'));
            } finally {
              setIsSharing(false);
            }
          },
        },
      ]
    );
  };

  const handleClose = () => {
    if (!isSharing) {
      onClose();
    }
  };

  if (!walk) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            disabled={isSharing}
          >
            <Ionicons name="close" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            {t('walks.share_walk')}
          </Text>
          
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* Walk Preview */}
          <View style={[styles.previewCard, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.preview, { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.previewTitle, { color: theme.colors.onSurface }]}>
                {walk.title || `${t('walks.walk_with')} ${walk.pet?.name}`}
              </Text>
              
              <Text style={[styles.previewDate, { color: theme.colors.onSurfaceVariant }]}>
                {formatDate(walk.startTime)}
              </Text>
              
              <View style={styles.previewStats}>
                <View style={styles.previewStat}>
                  <Ionicons name="walk" size={20} color={theme.colors.primary} />
                  <Text style={[styles.previewStatValue, { color: theme.colors.onSurface }]}>
                    {formatDistance(walk.distance)}
                  </Text>
                  <Text style={[styles.previewStatLabel, { color: theme.colors.onSurfaceVariant }]}>
                    {t('walks.distance')}
                  </Text>
                </View>
                
                <View style={styles.previewStat}>
                  <Ionicons name="time" size={20} color={theme.colors.primary} />
                  <Text style={[styles.previewStatValue, { color: theme.colors.onSurface }]}>
                    {formatDuration(walk.duration)}
                  </Text>
                  <Text style={[styles.previewStatLabel, { color: theme.colors.onSurfaceVariant }]}>
                    {t('walks.duration')}
                  </Text>
                </View>
                
                <View style={styles.previewStat}>
                  <Ionicons name="location" size={20} color={theme.colors.primary} />
                  <Text style={[styles.previewStatValue, { color: theme.colors.onSurface }]}>
                    {walk.pois?.length || 0}
                  </Text>
                  <Text style={[styles.previewStatLabel, { color: theme.colors.onSurfaceVariant }]}>
                    {t('walks.pois')}
                  </Text>
                </View>
              </View>
              
              <View style={styles.previewFooter}>
                <Text style={[styles.previewFooterText, { color: theme.colors.onSurfaceVariant }]}>
                  {t('walks.shared_via')} Hayotush
                </Text>
              </View>
            </View>
          </View>

          {/* Share Link Button */}
          <View style={styles.shareButtonContainer}>
            <TouchableOpacity
              style={[
                styles.shareButton,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: isSharing ? 0.6 : 1,
                },
              ]}
              onPress={handleShareLink}
              disabled={isSharing}
            >
              <View style={styles.shareButtonContent}>
                <View style={[styles.shareButtonIcon, { backgroundColor: theme.colors.onPrimary + '20' }]}>
                  <Ionicons name="link" size={24} color={theme.colors.onPrimary} />
                </View>
                <View style={styles.shareButtonText}>
                  <Text style={[styles.shareButtonTitle, { color: theme.colors.onPrimary }]}>
                    {t('walks.share_link')}
                  </Text>
                  <Text style={[styles.shareButtonSubtitle, { color: theme.colors.onPrimary + 'CC' }]}>
                    {t('walks.share_link_desc')}
                  </Text>
                </View>
                {isSharing && (
                  <ActivityIndicator size="small" color={theme.colors.onPrimary} />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  previewCard: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 24,
  },
  preview: {
    padding: 20,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  previewDate: {
    fontSize: 14,
    marginBottom: 20,
  },
  previewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  previewStat: {
    alignItems: 'center',
    flex: 1,
  },
  previewStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  previewStatLabel: {
    fontSize: 12,
  },
  previewFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
    width: '100%',
  },
  previewFooterText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  shareButtonContainer: {
    marginTop: 'auto',
  },
  shareButton: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  shareButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  shareButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  shareButtonText: {
    flex: 1,
  },
  shareButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  shareButtonSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ShareWalkModal;
