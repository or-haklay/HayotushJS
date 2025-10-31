import React, { useState, useRef } from 'react';
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
import Constants from 'expo-constants';

// Conditional import for ViewShot to avoid errors in Expo Go
let ViewShot = null;
try {
  if (Constants.executionEnvironment !== 'storeClient') {
    ViewShot = require('react-native-view-shot').default;
  }
} catch (error) {
  console.log('ViewShot not available:', error.message);
}

const { width } = Dimensions.get('window');

const ShareWalkModal = ({ visible, onClose, walk }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const viewShotRef = useRef(null);
  
  const [isSharing, setIsSharing] = useState(false);
  const [shareMethod, setShareMethod] = useState(null);

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

  const handleShareImage = async () => {
    if (!walk) return;
    
    setIsSharing(true);
    setShareMethod('image');
    
    try {
      if (!ViewShot || !viewShotRef.current) {
        Alert.alert(t('walks.error'), 'Image sharing not available in this environment');
        return;
      }
      
      const uri = await viewShotRef.current.capture();
      
      await Share.share({
        url: uri,
        message: `${t('walks.share_walk_message')} ${walk.title || `${t('walks.walk_with')} ${walk.pet?.name}`}\n\n${t('walks.distance')}: ${formatDistance(walk.distance)}\n${t('walks.duration')}: ${formatDuration(walk.duration)}\n${t('walks.pois')}: ${walk.pois?.length || 0}\n\n${t('walks.shared_via')} Hayotush`,
      });
    } catch (error) {
      console.error('Error sharing image:', error);
      Alert.alert(t('walks.error'), t('walks.share_image_error'));
    } finally {
      setIsSharing(false);
      setShareMethod(null);
    }
  };

  const handleShareLink = async () => {
    if (!walk) return;
    
    setIsSharing(true);
    setShareMethod('link');
    
    try {
      // TODO: Generate shareable link
      const shareLink = `https://hayotush.app/walk/${walk._id}`;
      
      await Share.share({
        url: shareLink,
        message: `${t('walks.share_walk_message')} ${walk.title || `${t('walks.walk_with')} ${walk.pet?.name}`}\n\n${t('walks.distance')}: ${formatDistance(walk.distance)}\n${t('walks.duration')}: ${formatDuration(walk.duration)}\n${t('walks.pois')}: ${walk.pois?.length || 0}\n\n${t('walks.view_walk')}: ${shareLink}`,
      });
    } catch (error) {
      console.error('Error sharing link:', error);
      Alert.alert(t('walks.error'), t('walks.share_link_error'));
    } finally {
      setIsSharing(false);
      setShareMethod(null);
    }
  };

  const handleShareGPX = async () => {
    if (!walk) return;
    
    setIsSharing(true);
    setShareMethod('gpx');
    
    try {
      // TODO: Generate GPX file
      Alert.alert(t('walks.gpx_export'), t('walks.gpx_coming_soon'));
    } catch (error) {
      console.error('Error sharing GPX:', error);
      Alert.alert(t('walks.error'), t('walks.share_gpx_error'));
    } finally {
      setIsSharing(false);
      setShareMethod(null);
    }
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
            {ViewShot ? (
              <ViewShot
                ref={viewShotRef}
                options={{ format: 'jpg', quality: 0.8 }}
                style={styles.previewContent}
              >
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
              </ViewShot>
            ) : (
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
            )}
          </View>

          {/* Share Options */}
          <View style={styles.shareOptions}>
            <Text style={[styles.optionsTitle, { color: theme.colors.onSurface }]}>
              {t('walks.choose_share_method')}
            </Text>
            
            <TouchableOpacity
              style={[
                styles.shareOption, 
                { 
                  backgroundColor: theme.colors.surface,
                  opacity: ViewShot ? 1 : 0.5
                }
              ]}
              onPress={handleShareImage}
              disabled={isSharing || !ViewShot}
            >
              <View style={styles.shareOptionContent}>
                <View style={[styles.shareIcon, { backgroundColor: '#4CAF50' + '20' }]}>
                  <Ionicons name="image" size={24} color="#4CAF50" />
                </View>
                <View style={styles.shareText}>
                  <Text style={[styles.shareTitle, { color: theme.colors.onSurface }]}>
                    {t('walks.share_image')}
                  </Text>
                  <Text style={[styles.shareSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                    {ViewShot ? t('walks.share_image_desc') : 'Not available in Expo Go'}
                  </Text>
                </View>
                {isSharing && shareMethod === 'image' && (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                )}
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.shareOption, { backgroundColor: theme.colors.surface }]}
              onPress={handleShareLink}
              disabled={isSharing}
            >
              <View style={styles.shareOptionContent}>
                <View style={[styles.shareIcon, { backgroundColor: '#2196F3' + '20' }]}>
                  <Ionicons name="link" size={24} color="#2196F3" />
                </View>
                <View style={styles.shareText}>
                  <Text style={[styles.shareTitle, { color: theme.colors.onSurface }]}>
                    {t('walks.share_link')}
                  </Text>
                  <Text style={[styles.shareSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                    {t('walks.share_link_desc')}
                  </Text>
                </View>
                {isSharing && shareMethod === 'link' && (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                )}
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.shareOption, { backgroundColor: theme.colors.surface }]}
              onPress={handleShareGPX}
              disabled={isSharing}
            >
              <View style={styles.shareOptionContent}>
                <View style={[styles.shareIcon, { backgroundColor: '#FF9800' + '20' }]}>
                  <Ionicons name="download" size={24} color="#FF9800" />
                </View>
                <View style={styles.shareText}>
                  <Text style={[styles.shareTitle, { color: theme.colors.onSurface }]}>
                    {t('walks.share_gpx')}
                  </Text>
                  <Text style={[styles.shareSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                    {t('walks.share_gpx_desc')}
                  </Text>
                </View>
                {isSharing && shareMethod === 'gpx' && (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
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
  previewContent: {
    borderRadius: 12,
    overflow: 'hidden',
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
  shareOptions: {
    flex: 1,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  shareOption: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  shareOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  shareIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  shareText: {
    flex: 1,
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  shareSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ShareWalkModal;
