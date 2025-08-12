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
import config from "../../config.json";
import { COLORS } from "../../theme/theme";
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
  const base = (config.URL || "").replace(/\/$/, "");
  return `${base}${rel.startsWith("/") ? "" : "/"}${rel}`;
};

export default function ServiceDetailsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id, name } = useLocalSearchParams();
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
                  backgroundColor: COLORS.background,
                }}
              />
            );
          }}
          style={{ paddingVertical: 8 }}
        />

        {/* Summary card */}
        <Card style={{ margin: 12, backgroundColor: COLORS.white }}>
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
                  selectedColor={COLORS.white}
                  style={{
                    backgroundColor: details.currentOpeningHours.openNow
                      ? COLORS.success
                      : COLORS.error,
                  }}
                >
                  {details.currentOpeningHours.openNow
                    ? t("details.open_now")
                    : t("details.closed")}
                </Chip>
              )}
              {typeof details.userRatingCount === "number" && (
                <Chip compact style={{ backgroundColor: COLORS.background }}>
                  {`${details.userRatingCount} ${t("details.reviews")}`}
                </Chip>
              )}
              {Array.isArray(details.types) &&
                details.types.slice(0, 3).map((t) => (
                  <Chip
                    key={t}
                    compact
                    style={{ backgroundColor: COLORS.background }}
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
              style={{ backgroundColor: COLORS.primary, marginVertical: 4 }}
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
            backgroundColor: COLORS.white,
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
        <Card
          style={{
            marginHorizontal: 12,
            marginTop: 12,
            backgroundColor: "transparent",
            elevation: 0,
          }}
        >
          <Card.Title title="Reviews" />
        </Card>
      </View>
    );
  };

  // reviews data for FlatList
  const reviews = useMemo(() => {
    const arr = Array.isArray(details?.reviews) ? details.reviews : [];
    return arr;
  }, [details?.reviews]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={title} />
        {typeof details?.rating === "number" && (
          <Badge
            style={{
              marginRight: 12,
              backgroundColor: COLORS.accent,
              color: COLORS.black,
            }}
          >
            {details.rating.toFixed(1)}
          </Badge>
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
            <View
              style={{ marginHorizontal: 12, backgroundColor: COLORS.white }}
            >
              <View style={{ paddingHorizontal: 12, paddingVertical: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontWeight: "600", color: COLORS.dark }}>
                    {toText(item?.authorAttribution?.displayName) || "User"}
                  </Text>
                  <Chip
                    compact
                    icon="star"
                    style={{ backgroundColor: COLORS.background }}
                  >
                    {typeof item?.rating === "number"
                      ? item.rating.toFixed(1)
                      : toText(item?.rating)}
                  </Chip>
                </View>
                {item?.text ? (
                  <Text style={{ color: COLORS.neutral, marginTop: 4 }}>
                    {toText(item.text)}
                  </Text>
                ) : null}
                {item?.publishTime ? (
                  <Text
                    style={{
                      color: COLORS.disabled,
                      marginTop: 2,
                      fontSize: 12,
                    }}
                  >
                    {toText(item.publishTime)}
                  </Text>
                ) : null}
              </View>
              <Divider />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}
