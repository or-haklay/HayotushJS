import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from "react-native";
import {
  Text,
  useTheme,
  IconButton,
  ActivityIndicator,
  Button,
} from "react-native-paper";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import petService from "../../services/petService";
import authService from "../../services/authService";
import { SIZING, FONTS, COLORS } from "../../theme/theme";
import { useTranslation } from "react-i18next";

const PlaceholderImage = require("../../assets/images/dog-think.png");

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

  const PetCard = ({ pet }) => (
    <TouchableOpacity
      style={styles.petCard}
      onPress={() => router.push("/profile")}
    >
      <Image
        source={
          pet?.profilePictureUrl
            ? { uri: pet.profilePictureUrl }
            : PlaceholderImage
        }
        style={styles.petImage}
      />
      <View style={styles.petInfo}>
        <Text style={styles.petName}>
          {pet?.name || t("home.no_pet_selected")}
        </Text>
        <Text style={styles.petType}>{pet?.type || ""}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={COLORS.disabled} />
    </TouchableOpacity>
  );

  // קומפוננטה פנימית לכפתורי הפעולה המהירים
  const QuickActionButton = ({ title, icon, color, onPress }) => (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: color }]}
      onPress={onPress}
    >
      {icon}
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
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
          source={PlaceholderImage}
          style={styles.placeholderImage}
          resizeMode="contain"
        />
        <Text variant="headlineSmall" style={{ textAlign: "center" }}>
          {t("home.welcome_to")}
        </Text>
        <Text variant="bodyLarge" style={styles.centerText}>
          {t("home.no_pets_yet")}
        </Text>
        <Button mode="contained" onPress={() => router.push("/add-pet")}>
          {t("home.add_first_pet")}
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { marginTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* כותרת עליונה */}
        <View style={styles.header}>
          <View style={styles.appTitleContainer}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={{ width: 40, height: 40 }}
            />
            <Text style={styles.appTitle}>Hayotush</Text>
          </View>
          <IconButton
            icon={"bell"}
            iconColor={COLORS.accent}
            size={28}
            onPress={() => console.log("Notifications")}
          />
        </View>

        <Text style={styles.greeting}>
          {t("home.welcome_back")}
          {user?.name?.split(" ")[0] || ""}!
        </Text>

        {/* תזכורת חשובה */}
        <View
          style={[
            styles.reminderCard,
            { backgroundColor: COLORS.primary, shadowColor: COLORS.primary },
          ]}
        >
          <View style={styles.reminderTextContainer}>
            <Text style={styles.reminderText}>{t("home.reminder_text1")}</Text>
            <Text style={styles.reminderPetName}>
              {t("home.reminder_text2")}
              {pets[0]?.name}
            </Text>
            <Text style={styles.reminderText}>
              {t("home.reminder_text_annual_checkup")}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.reminderButton, { backgroundColor: COLORS.accent }]}
            onPress={() => router.push("/add-event-modal")}
          >
            <Text style={styles.reminderButtonText}>
              {t("home.reminder_button")}
            </Text>
          </TouchableOpacity>
        </View>

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
            onPress={() => router.push("/reminders")}
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
            onPress={() => router.push("/expenses")}
          />
          <QuickActionButton
            title={t("home.medical_records")}
            icon={
              <Ionicons name="heart-outline" size={30} color={COLORS.white} />
            }
            color={COLORS.neutral}
            onPress={() => router.push("/medical-records")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// סגנונות העיצוב
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,

    borderRadius: SIZING.radius_md,
    elevation: 2,
  },
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  appTitle: {
    ...FONTS.h3,
    fontFamily: "Rubik",
    color: COLORS.neutral,
    marginLeft: SIZING.base,
  },
  greeting: {
    ...FONTS.h1,
    color: COLORS.neutral,
    marginTop: SIZING.margin,
    marginBottom: SIZING.margin * 1.5,
  },
  reminderCard: {
    padding: SIZING.padding,
    borderRadius: SIZING.radius_lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZING.margin * 2,
  },
  reminderTextContainer: {
    flex: 1,
  },
  reminderText: {
    ...FONTS.body,
    fontFamily: "Rubik",
    fontSize: 16,
    color: COLORS.white,
  },
  reminderPetName: {
    ...FONTS.h3,
    color: COLORS.white,
    marginVertical: SIZING.base / 2,
  },
  reminderButton: {
    paddingVertical: SIZING.base,
    paddingHorizontal: SIZING.padding,
    borderRadius: SIZING.radius_md,
    elevation: 2,
    alignSelf: "flex-end",
  },
  reminderButtonText: {
    ...FONTS.body,
    fontFamily: "Rubik",
    color: COLORS.primary,
    fontWeight: "bold",
  },
  sectionTitle: {
    ...FONTS.h2,
    color: COLORS.neutral,
    marginBottom: SIZING.margin,
  },
  petCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZING.radius_md,
    padding: SIZING.padding,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZING.margin * 2,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    width: "100%",
    marginRight: SIZING.margin,
  },
  petImage: {
    width: 70,
    height: 70,
    borderRadius: SIZING.radius_xl,
    marginRight: SIZING.margin,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    ...FONTS.h3,
    color: COLORS.neutral,
  },
  petType: {
    ...FONTS.body,
    color: COLORS.neutral,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: -SIZING.base / 2,
  },
  quickAction: {
    flex: 1,
    borderRadius: SIZING.radius_md,
    padding: SIZING.padding,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: SIZING.base / 2,
    minHeight: 120,
    elevation: 2,
  },
  quickActionText: {
    ...FONTS.body,
    fontFamily: "Rubik",
    fontSize: 12,
    color: COLORS.white,
    marginTop: SIZING.base,
    textAlign: "center",
  },
  placeholderImage: {
    width: "60%",
    maxHeight: 200,
    marginBottom: SIZING.base,
  },
});

export default HomeScreen;
