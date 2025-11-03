import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useTheme, Menu, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useWalk } from '../../context/WalkContext';
import { useAuth } from '../../hooks/useAuth';
import { useRTL } from '../../hooks/useRTL';
import { requestLocationPermissions } from '../../services/locationService';

const WalksScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const rtl = useRTL();
  const { 
    activeWalk, 
    isTracking, 
    startWalk, 
    stopWalk, 
    clearWalk,
    pets,
    loadPets,
    isLoadingPets 
  } = useWalk();

  const [selectedPet, setSelectedPet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showManualPetModal, setShowManualPetModal] = useState(false);
  const [manualPetName, setManualPetName] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadPets();
  }, []);


  // Set first pet as default when pets are loaded
  useEffect(() => {
    if (pets.length > 0 && !selectedPet) {
      setSelectedPet(pets[0]);
    }
  }, [pets]);

  const handleStartWalk = async () => {
    let petToUse = selectedPet;
    
    // If no pet selected, check if we should use manual input
    if (!petToUse) {
      if (pets.length === 0) {
        // No pets at all - show modal for manual entry
        setShowManualPetModal(true);
        return;
      } else {
        Alert.alert(t('walks.select_pet'), t('walks.select_pet_message'));
        return;
      }
    }

    setIsLoading(true);
    try {
      const hasPermission = await requestLocationPermissions();
      if (!hasPermission) {
        Alert.alert(t('walks.permission_denied'), t('walks.permission_message'));
        return;
      }

      await startWalk(petToUse);
      router.push('/walks/active-walk');
    } catch (error) {
      console.error('Error starting walk:', error);
      Alert.alert(t('walks.error'), t('walks.start_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualPetSubmit = async () => {
    if (!manualPetName.trim()) {
      Alert.alert(t('walks.error'), 'אנא הזן שם חיה');
      return;
    }

    // Create a temporary pet object
    const tempPet = {
      _id: `temp_${Date.now()}`,
      name: manualPetName.trim(),
      breed: '',
      species: 'pet'
    };

    setShowManualPetModal(false);
    setManualPetName('');
    
    // Start walk directly with the temp pet
    setIsLoading(true);
    try {
      const hasPermission = await requestLocationPermissions();
      if (!hasPermission) {
        Alert.alert(t('walks.permission_denied'), t('walks.permission_message'));
        return;
      }

      await startWalk(tempPet);
      router.push('/walks/active-walk');
    } catch (error) {
      console.error('Error starting walk:', error);
      Alert.alert(t('walks.error'), t('walks.start_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopWalk = async () => {
    Alert.alert(
      t('walks.stop_walk'),
      t('walks.stop_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('walks.stop'),
          style: 'destructive',
          onPress: async () => {
            try {
              await stopWalk();
              router.push('/walks/walk-history');
            } catch (error) {
              console.error('Error stopping walk:', error);
              Alert.alert(t('walks.error'), t('walks.stop_error'));
            }
          },
        },
      ]
    );
  };

  const handleContinueWalk = () => {
    router.push('/walks/active-walk');
  };

  const renderPetSelector = () => {
    if (pets.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="paw" size={48} color={theme.colors.outline} />
          <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            {t('walks.no_pets')}
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
            תוכל להזין שם חיה ידנית
          </Text>
        </View>
      );
    }

    // If only one pet, show it without dropdown
    if (pets.length === 1) {
      return (
        <View style={[styles.petSelector, { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.primary,
          borderWidth: 2,
        }]}>
          <View style={styles.petSelectorContent}>
            <Ionicons name="paw" size={20} color={theme.colors.primary} />
            <View style={styles.petSelectorText}>
              <Text style={[styles.petSelectorLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('walks.walking_with')}
              </Text>
              <Text style={[styles.petSelectorValue, { color: theme.colors.onSurface }]}>
                {pets[0].name}
              </Text>
            </View>
          </View>
          <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
        </View>
      );
    }

    // Multiple pets - show dropdown
    return (
      <View>
        <TouchableOpacity
          style={[styles.petSelector, { 
            backgroundColor: theme.colors.surface,
            borderColor: selectedPet ? theme.colors.primary : theme.colors.outline,
            borderWidth: selectedPet ? 2 : 1,
          }]}
          onPress={() => setMenuVisible(true)}
        >
          <View style={styles.petSelectorContent}>
            <Ionicons name="paw" size={20} color={selectedPet ? theme.colors.primary : theme.colors.onSurfaceVariant} />
            <View style={styles.petSelectorText}>
              <Text style={[styles.petSelectorLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('walks.select_pet')}
              </Text>
              <Text style={[styles.petSelectorValue, { color: theme.colors.onSurface }]}>
                {selectedPet?.name || t('walks.click_to_select')}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-down" size={20} color={theme.colors.onSurfaceVariant} />
        </TouchableOpacity>

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={{ x: 0, y: 0 }} // Hidden anchor since we use the button above
          contentStyle={[styles.menuContent, { backgroundColor: theme.colors.surface }]}
        >
          {pets.map((pet, index) => (
            <React.Fragment key={pet._id || index}>
              <Menu.Item
                onPress={() => {
                  setSelectedPet(pet);
                  setMenuVisible(false);
                }}
                title={pet.name}
                titleStyle={{ color: theme.colors.onSurface }}
                leadingIcon={selectedPet?._id === pet._id ? () => (
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                ) : undefined}
                style={selectedPet?._id === pet._id ? {
                  backgroundColor: theme.colors.primaryContainer,
                } : {}}
              />
              {index < pets.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Menu>
      </View>
    );
  };

  const renderActiveWalkCard = () => (
    <View style={[styles.activeWalkCard, { backgroundColor: theme.colors.primaryContainer }]}>
      <View style={styles.activeWalkHeader}>
        <Ionicons name="walk" size={24} color={theme.colors.primary} />
        <Text style={[styles.activeWalkTitle, { color: theme.colors.onPrimaryContainer }]}>
          {t('walks.active_walk')}
        </Text>
      </View>
      <Text style={[styles.activeWalkPet, { color: theme.colors.onPrimaryContainer }]}>
        {t('walks.with')} {activeWalk.pet?.name}
      </Text>
      <View style={styles.activeWalkStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.onPrimaryContainer }]}>
            {Math.round(activeWalk.distance)}m
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.onPrimaryContainer }]}>
            {t('walks.distance')}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.onPrimaryContainer }]}>
            {Math.round(activeWalk.duration / 60)}m
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.onPrimaryContainer }]}>
            {t('walks.duration')}
          </Text>
        </View>
      </View>
      <View style={styles.activeWalkActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleContinueWalk}
        >
          <Text style={[styles.actionButtonText, { color: theme.colors.onPrimary }]}>
            {t('walks.continue')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
          onPress={handleStopWalk}
        >
          <Text style={[styles.actionButtonText, { color: theme.colors.onError }]}>
            {t('walks.stop')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoadingPets) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
          {t('walks.loading_pets')}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          {t('walks.title')}
        </Text>

        {activeWalk ? (
          renderActiveWalkCard()
        ) : (
          <>
            {pets.length > 0 && (
              <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
                {pets.length === 1 ? t('walks.walking_with') : t('walks.select_pet')}
              </Text>
            )}
            
            {renderPetSelector()}

            <TouchableOpacity
              style={[
                styles.startButton,
                { 
                  backgroundColor: (selectedPet || pets.length === 1 || pets.length === 0) ? theme.colors.primary : theme.colors.outline,
                  opacity: (selectedPet || pets.length === 1 || pets.length === 0) ? 1 : 0.5,
                  marginTop: pets.length > 0 ? 16 : 0,
                }
              ]}
              onPress={handleStartWalk}
              disabled={isLoading || (pets.length > 1 && !selectedPet)}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.onPrimary} />
              ) : (
                <>
                  <Ionicons name="play" size={24} color={theme.colors.onPrimary} />
                  <Text style={[styles.startButtonText, { color: theme.colors.onPrimary }]}>
                    {t('walks.start_walk')}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            
            {/* Manual Pet Name Modal */}
            <Modal
              visible={showManualPetModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowManualPetModal(false)}
            >
              <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                    הזן שם חיה
                  </Text>
                  <TextInput
                    style={[styles.modalInput, { 
                      backgroundColor: theme.colors.background,
                      color: theme.colors.onBackground,
                      borderColor: theme.colors.outline,
                      textAlign: rtl.textAlign,
                    }]}
                    placeholder="שם החיה"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    value={manualPetName}
                    onChangeText={setManualPetName}
                    autoFocus
                  />
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonCancel, { borderColor: theme.colors.outline }]}
                      onPress={() => {
                        setShowManualPetModal(false);
                        setManualPetName('');
                      }}
                    >
                      <Text style={[styles.modalButtonText, { color: theme.colors.onSurface }]}>
                        {t('common.cancel')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonSubmit, { backgroundColor: theme.colors.primary }]}
                      onPress={handleManualPetSubmit}
                    >
                      <Text style={[styles.modalButtonText, { color: theme.colors.onPrimary }]}>
                        התחל טיול
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </>
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.colors.outline }]}
            onPress={() => router.push('/walks/walk-history')}
          >
            <Ionicons name="time" size={20} color={theme.colors.onSurface} />
            <Text style={[styles.actionButtonText, { color: theme.colors.onSurface }]}>
              {t('walks.history')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryContainer }]}
            onPress={() => router.push('/walks/walk-stats')}
          >
            <Ionicons name="stats-chart" size={20} color={theme.colors.primary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.onPrimaryContainer }]}>
              {t('walks.stats')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  petSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  petSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  petSelectorText: {
    marginLeft: 12,
    flex: 1,
  },
  petSelectorLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  petSelectorValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuContent: {
    borderRadius: 12,
  },
  activeWalkCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  activeWalkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  activeWalkTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  activeWalkPet: {
    fontSize: 16,
    marginBottom: 15,
  },
  activeWalkStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  activeWalkActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    borderWidth: 1,
  },
  modalButtonSubmit: {
    // backgroundColor set inline
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WalksScreen;
