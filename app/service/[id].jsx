// app/service/[id].js
// Service/business detail page using React Native Paper + expo-router
// Palette matches Search screen; data mocked for now (ready to wire to proxy in Step 6)

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  Image,
  Linking,
  FlatList,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Appbar,
  Card,
  Text,
  Chip,
  Button,
  IconButton,
  Divider,
  ActivityIndicator,
  Badge,
} from "react-native-paper";
import placesService from "../../services/placesService";
// import config from "../../config.json"; // קובץ לא קיים
import { getColors, COLORS } from "../../theme/theme";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

// Mock details API (replace with proxy /details/:place_id)
const toText = (v) => {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && typeof v.text === "string") return v.text;
  return String(v);
};

const absolutePhoto = (name, maxWidth = 900) => {
  if (!name) return null;
  const rel = placesService.getPhotoUrl(name, maxWidth); // returns /api/places/photo?...
  const base = "https://api.hayotush.com/api"; // URL קבוע
  return `${base}${rel.startsWith("/") ? "" : "/"}${rel}`;
};

export default function ServiceDetailsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id, name } = useLocalSearchParams();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await placesService.getPlaceDetails(id);
      setDetails(res);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const title = useMemo(
    () => toText(details?.displayName) || toText(name) || "Service",
    [details?.displayName, name]
  );

  const handleCall = () => {
    const phone = toText(details?.nationalPhoneNumber).replace(/[^+\d]/g, "");
    if (phone) Linking.openURL(`tel:${phone}`);
  };
  const handleWebsite = () => {
    const url = toText(details?.websiteUri);
    if (url) Linking.openURL(url);
  };
  const handleMessage = () => {
    const phone = toText(details?.nationalPhoneNumber).replace(/[^+\d]/g, "");
    if (phone) Linking.openURL(`https://wa.me/${phone}`);
  };
  const handleNavigate = () => {
    const uri = toText(details?.googleMapsUri);
    if (uri) Linking.openURL(uri);
  };

  // ---- header chunks for FlatList ----
  const Header = () => {
    if (!details) return null;
    const photos = Array.isArray(details.photos) ? details.photos : [];

    return (
      <View>
        {/* Photos carousel (horizontal) */}
        <FlatList
          data={photos}
          keyExtractor={(p, i) => p?.name || `photo_${i}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          ListHeaderComponent={<View style={{ width: 8 }} />}
          ListFooterComponent={<View style={{ width: 8 }} />}
          renderItem={({ item }) => {
            const uri = absolutePhoto(item?.name, 900);
            return (
              <Image
                source={{ uri }}
                style={{
                  width: 280,
                  height: 180,
                  borderRadius: 12,
                  marginHorizontal: 8,
                  backgroundColor: colors.background,
                }}
              />
            );
          }}
          style={{ paddingVertical: 8 }}
        />

        {/* Summary card */}
        <Card
          style={{
            margin: 12,
            backgroundColor: colors.surface,
            elevation: 3,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            borderRadius: 12,
          }}
        >
          <Card.Title
            title={title}
            subtitle={toText(details.formattedAddress)}
          />
          <Card.Content>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {details.currentOpeningHours?.openNow != null && (
                <Chip
                  compact
                  icon={details.currentOpeningHours.openNow ? "check" : "close"}
                  selectedColor={colors.white}
                  style={{
                    backgroundColor: details.currentOpeningHours.openNow
                      ? colors.success
                      : colors.error,
                  }}
                >
                  {details.currentOpeningHours.openNow
                    ? t("details.open_now")
                    : t("details.closed")}
                </Chip>
              )}
              {typeof details.rating === "number" && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: colors.primary,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    marginRight: 8,
                  }}
                >
                  <Text
                    style={{
                      color: colors.white,
                      fontSize: 14,
                      fontWeight: "bold",
                      marginRight: 4,
                    }}
                  >
                    ⭐
                  </Text>
                  <Text
                    style={{
                      color: colors.white,
                      fontSize: 14,
                      fontWeight: "bold",
                    }}
                  >
                    {details.rating.toFixed(1)}
                  </Text>
                </View>
              )}
              {typeof details.userRatingCount === "number" && (
                <Chip compact style={{ backgroundColor: colors.background }}>
                  {`${details.userRatingCount} ${t("details.reviews")}`}
                </Chip>
              )}
              {Array.isArray(details.types) &&
                details.types.slice(0, 3).map((t) => (
                  <Chip
                    key={t}
                    compact
                    style={{ backgroundColor: colors.background }}
                  >
                    {t}
                  </Chip>
                ))}
            </View>
          </Card.Content>

          <Card.Actions
            style={{
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              flexDirection: "row",
            }}
          >
            <Button
              icon="phone"
              onPress={handleCall}
              mode="contained"
              style={{ backgroundColor: colors.primary, marginVertical: 4 }}
            >
              {t("details.call")}
            </Button>
            <Button
              icon="web"
              onPress={handleWebsite}
              mode="contained-tonal"
              style={{ marginVertical: 4 }}
            >
              {t("details.website")}
            </Button>
            <Button
              icon="message"
              onPress={handleMessage}
              mode="contained-tonal"
              style={{ marginVertical: 4 }}
            >
              {t("details.message")}
            </Button>
            <Button
              icon="navigation"
              onPress={handleNavigate}
              mode="contained-tonal"
              style={{ marginVertical: 4, alignSelf: "center" }}
            >
              {t("details.navigate")}
            </Button>
          </Card.Actions>
        </Card>

        {/* Opening hours */}
        <Card
          style={{
            marginHorizontal: 12,
            marginTop: 4,
            backgroundColor: colors.surface,
            elevation: 2,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
            borderRadius: 12,
          }}
        >
          <Card.Title title="Opening Hours" />
          <Card.Content>
            {Array.isArray(details.regularOpeningHours?.weekdayDescriptions) &&
            details.regularOpeningHours.weekdayDescriptions.length > 0 ? (
              details.regularOpeningHours.weekdayDescriptions.map((d, i) => (
                <Text key={i} style={{ color: COLORS.dark, marginBottom: 2 }}>
                  {toText(d)}
                </Text>
              ))
            ) : (
              <Text>{t("details.hours.none")}</Text>
            )}
          </Card.Content>
        </Card>

        <Divider style={{ marginTop: 12 }} />

        {/* Reviews title */}
        <View
          style={{
            marginHorizontal: 12,
            marginTop: 16,
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: COLORS.dark,
              marginBottom: 4,
            }}
          >
            ביקורות
          </Text>
          <View
            style={{
              height: 2,
              backgroundColor: colors.primary,
              width: 40,
              borderRadius: 1,
            }}
          />
        </View>
      </View>
    );
  };

  // reviews data for FlatList
  const reviews = useMemo(() => {
    const arr = Array.isArray(details?.reviews) ? details.reviews : [];
    return arr;
  }, [details?.reviews]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={title} />
        {typeof details?.rating === "number" && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.primary,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              marginRight: 12,
            }}
          >
            <Text
              style={{
                color: COLORS.white,
                fontSize: 16,
                fontWeight: "bold",
                marginRight: 4,
              }}
            >
              ⭐
            </Text>
            <Text
              style={{
                color: COLORS.white,
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              {details.rating.toFixed(1)}
            </Text>
          </View>
        )}
      </Appbar.Header>

      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(_, idx) => `rev_${idx}`}
          ListHeaderComponent={<Header />}
          renderItem={({ item }) => (
            <Card
              style={{
                marginHorizontal: 12,
                marginVertical: 4,
                backgroundColor: colors.surface,
                elevation: 1,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
              }}
            >
              <Card.Content style={{ paddingVertical: 8 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "600",
                      color: COLORS.dark,
                      fontSize: 16,
                    }}
                  >
                    {toText(item?.authorAttribution?.displayName) || "User"}
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.primary,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: colors.white,
                        fontSize: 12,
                        fontWeight: "bold",
                        marginRight: 2,
                      }}
                    >
                      ⭐
                    </Text>
                    <Text
                      style={{
                        color: colors.white,
                        fontSize: 11,
                        fontWeight: "bold",
                      }}
                    >
                      {typeof item?.rating === "number"
                        ? item.rating.toFixed(1)
                        : toText(item?.rating)}
                    </Text>
                  </View>
                </View>
                {item?.text ? (
                  <Text
                    style={{
                      color: COLORS.neutral,
                      marginBottom: 8,
                      lineHeight: 20,
                      fontSize: 14,
                    }}
                  >
                    {toText(item.text)}
                  </Text>
                ) : null}
                {item?.publishTime ? (
                  <Text
                    style={{
                      color: COLORS.disabled,
                      fontSize: 12,
                      fontStyle: "italic",
                    }}
                  >
                    {new Date(item.publishTime).toLocaleDateString("he-IL", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                ) : null}
              </Card.Content>
            </Card>
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}
