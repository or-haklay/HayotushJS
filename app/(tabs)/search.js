// app/(tabs)/search.js
// Search page for pet services using React Native Paper + expo-router
// Includes real device location via expo-location

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, FlatList, SafeAreaView, StyleSheet } from "react-native";
import * as Location from "expo-location";
import {
  Searchbar,
  Chip,
  Divider,
  ActivityIndicator,
  Button,
  SegmentedButtons,
  Menu,
} from "react-native-paper";
import renderItem from "../../components/search/SearchResultCard";
import { COLORS, FONTS, SIZING } from "../../theme/theme";
import placesService from "../../services/placesService";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

const debounce = (fn, ms = 400) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};
const genSessionToken = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
const distanceMeters = (lat1, lon1, lat2, lon2) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

const RATING_OPTIONS = [0, 3.5, 4.0, 4.5, 5.0];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all_pets");
  const [minRating, setMinRating] = useState(0);
  const [openNow, setOpenNow] = useState(false);
  const [sortBy, setSortBy] = useState("distance");
  const [radiusMeters, setRadiusMeters] = useState(5000);
  const [ratingMenuVisible, setRatingMenuVisible] = useState(false);
  const [rawData, setRawData] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [sessionToken, setSessionToken] = useState(genSessionToken());
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const CATEGORIES = React.useMemo(
    () => [
      { value: "all_pets", label: t("category.all") },
      { value: "vets", label: t("category.vets") },
      { value: "pet_stores", label: t("category.pet_stores") },
      { value: "dog_parks", label: t("category.dog_parks") },
      { value: "groomers", label: t("category.groomers") },
      { value: "boarding", label: t("category.boarding") },
      { value: "sitters", label: t("category.sitters") },
      { value: "trainers", label: t("category.trainers") },
      { value: "shelters", label: t("category.shelters") },
    ],
    [t]
  );

  const SORTS = [
    { value: "relevance", label: t("sort.relevance") },
    { value: "distance", label: t("sort.distance") },
    { value: "rating", label: t("sort.rating") },
  ];
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        let loc = await Location.getCurrentPositionAsync({});
        setLat(loc.coords.latitude);
        setLng(loc.coords.longitude);
      } else {
        setLat(32.0853);
        setLng(34.7818);
      }
    })();
  }, []);

  const runSearch = useCallback(
    async (opts = {}) => {
      if (lat == null || lng == null) return;
      setLoading(true);
      try {
        const res = await placesService.searchPlaces({
          q: query || undefined,
          petCategory: category || "all_pets",
          lat,
          lng,
          radius: radiusMeters,
          sessionToken,
          rank: sortBy === "distance" ? "distance" : "relevance",
          maxResults: 20,
          regionCode: "IL",
          languageCode: "he", // default Hebrew
        });

        const list = res?.places || [];
        const combined = opts.pageToken ? [...rawData, ...list] : list; // paging placeholder
        setRawData(combined);
        setNextPageToken(null); // (אח”כ נוסיף paging אם נרצה)
      } catch (e) {
        console.warn("Search failed", e?.response?.data || e?.message);
      } finally {
        setLoading(false);
      }
    },
    [query, category, radiusMeters, sessionToken, rawData, lat, lng, sortBy]
  );

  useEffect(() => {
    const enriched = rawData
      .map((p) => ({
        ...p,
        _distanceM: p.location
          ? distanceMeters(lat, lng, p.location.latitude, p.location.longitude)
          : null,
      }))
      .filter((p) => (minRating ? (p.rating || 0) >= minRating : true))
      .filter((p) =>
        openNow ? p.currentOpeningHours?.openNow === true : true
      );

    const sorted = [...enriched].sort((a, b) => {
      if (sortBy === "distance")
        return (a._distanceM || Infinity) - (b._distanceM || Infinity);
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
    setData(sorted);
  }, [rawData, minRating, openNow, sortBy, lat, lng]);

  const debouncedSearch = useMemo(
    () => debounce(() => runSearch(), 450),
    [runSearch]
  );
  useEffect(() => {
    debouncedSearch();
  }, [query, category, radiusMeters, lat, lng]);
  const handleRefresh = async () => {
    setRefreshing(true);
    await runSearch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { marginTop: insets.top }]}>
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View
          style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4 }}
        >
          <Searchbar
            placeholder={t("search.placeholder")}
            value={query}
            iconColor={COLORS.primary}
            inputStyle={{ color: COLORS.dark }}
            style={styles.searchbar}
            onChangeText={(t) => {
              setQuery(t);
              if (!t) setSessionToken(genSessionToken());
            }}
            onIconPress={() => runSearch()}
            onSubmitEditing={() => runSearch()}
          />

          <View style={styles.categoryContainer}>
            <FlatList
              data={CATEGORIES}
              horizontal
              keyExtractor={(i) => i.value}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item: c }) => (
                <Chip
                  selected={category === c.value}
                  onPress={() =>
                    setCategory(category === c.value ? "all_pets" : c.value)
                  }
                  style={{
                    marginRight: 6,
                    backgroundColor:
                      category === c.value ? COLORS.primary : COLORS.white,
                    borderColor: COLORS.neutral + "33",
                    borderWidth: 1,
                  }}
                  textStyle={{
                    color: category === c.value ? COLORS.white : COLORS.dark,
                  }}
                >
                  {c.label}
                </Chip>
              )}
            />
          </View>

          <View style={{ marginTop: 8 }}>
            <SegmentedButtons
              value={sortBy}
              onValueChange={setSortBy}
              buttons={SORTS.map((s) => ({ value: s.value, label: s.label }))}
              style={{ backgroundColor: COLORS.white }}
              theme={styles.segmentedButtons}
            />
          </View>

          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}
          >
            <Chip
              selected={openNow}
              onPress={() => setOpenNow((v) => !v)}
              icon="clock-outline"
              style={{
                marginRight: 6,
                backgroundColor: openNow ? COLORS.primary : COLORS.white,
                borderColor: COLORS.neutral + "33",
                borderWidth: 1,
              }}
              textStyle={{ color: openNow ? COLORS.white : COLORS.dark }}
            >
              {t("filter.open_now")}
            </Chip>

            <Menu
              visible={ratingMenuVisible}
              onDismiss={() => setRatingMenuVisible(false)}
              anchor={
                <Chip
                  onPress={() => setRatingMenuVisible(true)}
                  icon="star"
                  style={{
                    backgroundColor: COLORS.white,
                    borderColor: COLORS.neutral + "33",
                    borderWidth: 1,
                  }}
                >{`${t("filter.min_rating")}: ${minRating.toFixed(1)}`}</Chip>
              }
            >
              {RATING_OPTIONS.map((val) => (
                <Menu.Item
                  key={val}
                  onPress={() => {
                    setMinRating(val);
                    setRatingMenuVisible(false);
                  }}
                  title={val.toFixed(1)}
                />
              ))}
            </Menu>
          </View>
        </View>

        <Divider />

        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReachedThreshold={0.6}
          onEndReached={() => {
            if (nextPageToken && !loading) {
              runSearch({ pageToken: nextPageToken });
            }
          }}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator style={{ marginVertical: 12 }} />
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />

        <View style={styles.clearButtonContainer}>
          <Button
            mode="contained-tonal"
            icon="filter-remove"
            textColor={COLORS.dark}
            style={{ backgroundColor: COLORS.accent }}
            onPress={() => {
              setCategory(undefined);
              setMinRating(0);
              setOpenNow(false);
              setSortBy("distance");
              setRadiusMeters(5000);
              setSessionToken(genSessionToken());
              runSearch();
            }}
          >
            {t("action.clear_filters")}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

// סגנונות העיצוב
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: SIZING.radius_md,
  },
  searchbar: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.neutral + "33",
    borderWidth: 1,
  },
  categoryContainer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  segmentedButtons: {
    colors: {
      secondaryContainer: COLORS.primary,
      onSecondaryContainer: COLORS.white,
      primary: COLORS.primary,
    },
  },
  clearButtonContainer: {
    position: "absolute",
    right: 12,
    bottom: 20,
  },
});
