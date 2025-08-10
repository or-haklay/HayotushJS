import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Text, Button, ActivityIndicator } from "react-native-paper";
import { COLORS, SIZING, FONTS } from "../../theme/theme"; // שים לב: בתוך (tabs) → ../../
import { useRouter } from "expo-router";
import petService from "../../services/petService";

const PlaceholderImage = require("../../assets/images/dog-think.png");

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pet, setPet] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const myPets = await petService.getMyPets();
        setPet(myPets?.[0] || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={styles.center}>
        <Image source={PlaceholderImage} style={{ width: 180, height: 180 }} />
        <Text style={{ marginVertical: SIZING.base }}>
          אין חיה בפרופיל כרגע
        </Text>
        <Button mode="contained" onPress={() => router.push("/add-pet")}>
          הוסף חיית מחמד
        </Button>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Image
          source={
            pet?.profilePictureUrl
              ? { uri: pet.profilePictureUrl }
              : PlaceholderImage
          }
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{pet.name}</Text>
          <Text style={styles.meta}>
            {pet.type} · {pet.breed || "לא ידוע"}
          </Text>
          <Text style={styles.meta}>
            {pet.birthDate
              ? new Date(pet.birthDate).toLocaleDateString()
              : "תאריך לידה לא ידוע"}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button mode="contained" onPress={() => router.push("/reminders")}>
          תזכורות
        </Button>
        <Button mode="outlined" onPress={() => router.push("/medical-records")}>
          היסטוריה רפואית
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: SIZING.padding, backgroundColor: COLORS.background },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SIZING.padding,
  },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: SIZING.radius_md,
    padding: SIZING.padding,
    elevation: 2,
    marginBottom: SIZING.margin * 2,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: SIZING.radius_xl,
    marginRight: SIZING.margin,
  },
  name: { ...FONTS.h2, color: COLORS.neutral },
  meta: { ...FONTS.body, color: COLORS.neutral },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SIZING.base,
  },
});
