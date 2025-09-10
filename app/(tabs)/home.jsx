import React, { useState, useRef } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Image,
  ImageBackground,
} from "react-native";
import { Text, useTheme, ActivityIndicator, Button } from "react-native-paper";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import petService from "../../services/petService";
import authService from "../../services/authService";
import { SIZING, FONTS, COLORS } from "../../theme/theme";
import { useTranslation } from "react-i18next";
import { useToast } from "../../context/ToastContext";

// Import our new components
import ScreenContainer from "../../components/ui/ScreenContainer";
import Header from "../../components/ui/Header";
import ReminderCard from "../../components/home/ReminderCard";
import DailyMissions from "../../components/home/DailyMissions";
import DailyTipCard from "../../components/home/DailyTipCard";
import PetCard from "../../components/home/PetCard";
import QuickActionButton from "../../components/home/QuickActionButton";
import * as gamificationService from "../../services/gamificationService";
import NotificationBell from "../../components/ui/NotificationBell";

const HomeScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { showSuccess } = useToast();
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gSummary, setGSummary] = useState(null);
  const hasShownBonusToast = useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        try {
          if (isLoading) {
            const currentUser = await authService.getUser();
            setUser(currentUser);
            const userPets = await petService.getMyPets();
            setPets(userPets.length > 0 ? userPets : []);
            try {
              const summary = await gamificationService.getSummary();
              setGSummary(summary);
              if (
                summary?.dailyCompletionBonusToday &&
                !hasShownBonusToast.current
              ) {
                hasShownBonusToast.current = true;
                showSuccess(
                  t("toast.success.points_earned_daily_bonus", { count: 5 })
                );
              } else if (
                summary?.weeklyPerfectBonusToday &&
                !hasShownBonusToast.current
              ) {
                hasShownBonusToast.current = true;
                showSuccess(
                  t("toast.success.points_earned_weekly_bonus", { count: 30 })
                );
              }
            } catch (e) {
              console.warn("gamification summary failed", e?.message || e);
            }
          }
        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }, [isLoading, t, showSuccess])
  );

  // מצב טעינה ראשוני
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // מצב ריק - אם למשתמש אין חיות מחמד
  if (!pets || pets.length === 0) {
    return (
      <View style={[styles.centerContainer, { marginTop: insets.top }]}>
        <Image
          source={require("../../assets/images/dogs/dog-think.png")}
          style={styles.placeholderImage}
          resizeMode="contain"
        />
        <Text variant="headlineSmall" style={{ textAlign: "center" }}>
          {t("home.welcome_to")}
        </Text>
        <Text variant="bodyLarge" style={styles.centerText}>
          {t("home.no_pets_yet")}
        </Text>
        <Button
          mode="contained"
          onPress={() => router.push("/pets/create/Step1")}
        >
          {t("home.add_first_pet")}
        </Button>
      </View>
    );
  }

  return (
    <ScreenContainer>
      <Header
        title="Hayotush"
        showLogo={true}
        rightIcon="bell"
        onRightPress={() => {}}
      />

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.greeting}>
          {t("home.welcome_back")} {user?.name?.split(" ")[0] || ""}!
        </Text>

        {/* Daily Tip / Fact */}
        <DailyTipCard
          petSpecies={pets?.[0]?.species || null}
          userId={user?._id || user?.id || null}
        />

        <Text style={styles.sectionTitle}>{t("home.my_pets")}</Text>
        <PetCard pet={pets[0]} />
        {gSummary ? (
          <DailyMissions
            points={gSummary.points}
            streak={gSummary.dailyStreak}
            missions={gSummary.missions}
            dateKey={gSummary.dateKey}
            onRefresh={async () => {
              try {
                const fresh = await gamificationService.getSummary();
                setGSummary(fresh);
                // Don't show bonus toasts on refresh - only on initial load
              } catch {}
            }}
          />
        ) : null}
        <Text style={styles.sectionTitle}>{t("home.quick_actions")}</Text>
        <View style={styles.quickActionsContainer}>
          <QuickActionButton
            title={t("home.reminders")}
            icon={
              <Ionicons
                name="notifications-outline"
                size={30}
                color={COLORS.white}
              />
            }
            color={COLORS.primary}
            onPress={() => {
              if (pets && pets.length > 0) {
                router.push(`/pets/${pets[0].id || pets[0]._id}/reminders`);
              } else {
                // אם אין חיות, נשלח לרשימת החיות
                router.push("/pets");
              }
            }}
          />
          <QuickActionButton
            title={t("home.expenses")}
            icon={
              <MaterialCommunityIcons
                name="cash-multiple"
                size={30}
                color={COLORS.white}
              />
            }
            color={COLORS.accent}
            onPress={() => {
              if (pets && pets.length > 0) {
                router.push(`/pets/${pets[0].id || pets[0]._id}/expenses`);
              } else {
                // אם אין חיות, נשלח לרשימת החיות
                router.push("/pets");
              }
            }}
          />
          <QuickActionButton
            title={t("home.medical_records")}
            icon={
              <Ionicons name="heart-outline" size={30} color={COLORS.white} />
            }
            color={COLORS.neutral}
            onPress={() => {
              if (pets && pets.length > 0) {
                router.push(
                  `/pets/${pets[0].id || pets[0]._id}/medical-records`
                );
              } else {
                // אם אין חיות, נשלח לרשימת החיות
                router.push("/pets");
              }
            }}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

// סגנונות העיצוב
const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZING.padding,
    backgroundColor: COLORS.background,
    margin: SIZING.pageMargin,
    borderRadius: SIZING.radius_md,
    elevation: 2,
  },

  centerText: {
    marginVertical: SIZING.margin,
    textAlign: "center",
    ...FONTS.body,
  },
  scrollViewContent: {
    padding: SIZING.padding,
  },
  greeting: {
    ...FONTS.h1,
    color: COLORS.neutral,
    marginTop: SIZING.margin,
    marginBottom: SIZING.margin * 1.5,
  },
  sectionTitle: {
    ...FONTS.h2,
    color: COLORS.neutral,
    marginBottom: SIZING.margin,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: -SIZING.base / 2,
  },
  placeholderImage: {
    width: "60%",
    maxHeight: 200,
    marginBottom: SIZING.base,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: SIZING.padding,
  },
});

export default HomeScreen;
