import React, { useState } from "react";
import { ScrollView, View, StyleSheet, Image } from "react-native";
import { Text, useTheme, ActivityIndicator, Button } from "react-native-paper";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import petService from "../../services/petService";
import authService from "../../services/authService";
import { SIZING, FONTS, COLORS } from "../../theme/theme";
import { useTranslation } from "react-i18next";

// Import our new components
import ScreenContainer from "../../components/ui/ScreenContainer";
import Header from "../../components/ui/Header";
import ReminderCard from "../../components/home/ReminderCard";
import PetCard from "../../components/home/PetCard";
import QuickActionButton from "../../components/home/QuickActionButton";
import NotificationBell from "../../components/ui/NotificationBell";

const HomeScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        try {
          if (isLoading) {
            const currentUser = await authService.getUser();
            setUser(currentUser);
            const userPets = await petService.getMyPets();
            setPets(userPets.length > 0 ? userPets : []);
          }
        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }, [])
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
        onRightPress={() => console.log("Notifications")}
      />

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.greeting}>
          {t("home.welcome_back")} {user?.name?.split(" ")[0] || ""}!
        </Text>

        <ReminderCard
          reminderText1={t("home.reminder_text1")}
          reminderText2={t("home.reminder_text2")}
          reminderText3={t("home.reminder_text_annual_checkup")}
          petName={pets[0]?.name}
          buttonText={t("home.reminder_button")}
          onButtonPress={() => {
            if (pets && pets.length > 0) {
              router.push(`/pets/${pets[0].id || pets[0]._id}/reminders/new`);
            } else {
              // אם אין חיות, נשלח לרשימת החיות
              router.push("/pets");
            }
          }}
        />

        <Text style={styles.sectionTitle}>{t("home.my_pets")}</Text>
        <PetCard pet={pets[0]} />

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
