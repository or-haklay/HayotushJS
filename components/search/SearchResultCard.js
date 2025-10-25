import React, { useEffect, useMemo, useState } from "react";
import { Card, Chip, IconButton, Badge } from "react-native-paper";
import { StyleSheet, Linking, Image, View } from "react-native";
import { getColors } from "../../theme/theme";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "expo-router";
import Fontisto from "@expo/vector-icons/Fontisto";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import placesService from "../../services/placesService";
// import config from "../../config.json"; // קובץ לא קיים

// This component uses hooks, so it must be a function component itself.
// The renderItem in the FlatList should be a function that returns this component.
const SearchResultCard = ({ item, category }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const styles = createStyles(colors);

  const iconForType = (primaryType, types = []) => {
    const main = (primaryType || "").toLowerCase();
    const all = [main, ...types.map((x) => (x || "").toLowerCase())];
    if (all.some((x) => x.includes("veterinary"))) return "stethoscope";
    if (all.some((x) => x.includes("pet_store"))) return "storefront-outline";
    if (all.some((x) => x.includes("dog_park"))) return "dog";
    if (all.some((x) => x.includes("groom"))) return "content-cut";
    if (all.some((x) => x.includes("boarding") || x.includes("hotel")))
      return "home-heart";
    if (all.some((x) => x.includes("sitter") || x.includes("walker")))
      return "account-heart";
    if (all.some((x) => x.includes("train"))) return "whistle";
    if (all.some((x) => x.includes("shelter") || x.includes("adoption")))
      return "home-heart";
    return "paw";
  };

  const absolutePhoto = (name, maxWidth = 160) => {
    if (!name) return null;
    const rel = placesService.getPhotoUrl(name, maxWidth);
    const base = "https://api.hayotush.com/api"; // URL קבוע
    return `${base}${rel.startsWith("/") ? "" : "/"}${rel}`;
  };

  const goToDetails = () => {
    router.push({
      pathname: "/service/[id]",
      params: {
        id: item.id,
        name: item.displayName?.text || t("common.service"),
      },
    });
  };

  const openMaps = () => {
    if (item.googleMapsUri) Linking.openURL(item.googleMapsUri);
    else if (item.id)
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          item.displayName?.text || ""
        )}&query_place_id=${item.id}`
      );
  };

  const photoName = item?.photos?.[0]?.name;
  const photoUri = useMemo(() => absolutePhoto(photoName, 160), [photoName]);
  const [hasPhoto, setHasPhoto] = useState(!!photoUri);
  useEffect(() => {
    setHasPhoto(!!photoUri);
  }, [photoUri]);
  const leftIconName =
    (category
      ? (function () {
          const c = (category || "").toLowerCase();
          switch (c) {
            case "vets":
              return "stethoscope";
            case "pet_stores":
              return "storefront-outline";
            case "dog_parks":
              return "dog";
            case "groomers":
              return "content-cut";
            case "boarding":
              return "home-heart";
            case "sitters":
              return "account-heart";
            case "trainers":
              return "whistle";
            case "shelters":
              return "home-heart";
            default:
              return null;
          }
        })()
      : null) || iconForType(item?.primaryType, item?.types || []);

  return (
    <Card style={styles.card} onPress={goToDetails}>
      <Card.Title
        title={item.displayName?.text || t("common.no_name")}
        subtitle={`${item.formattedAddress || ""}${
          item._distanceM != null
            ? ` • ${(item._distanceM / 1000).toFixed(1)} km`
            : ""
        }`}
        titleStyle={styles.cardTitle.title}
        subtitleStyle={styles.cardTitle.subtitle}
        left={() =>
          hasPhoto && photoUri ? (
            <Image
              source={{ uri: photoUri }}
              style={styles.thumb}
              onError={() => setHasPhoto(false)}
            />
          ) : (
            <View style={styles.thumbIcon}>
              <MaterialCommunityIcons
                name={leftIconName}
                size={22}
                color={colors.primary}
              />
            </View>
          )
        }
        right={(props) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 15,
            }}
          >
            <MaterialCommunityIcons
              name="navigation-variant-outline"
              size={26}
              color={colors.primary}
              onPress={openMaps}
            />
          </View>
        )}
      />
      <Card.Content>
        <View style={styles.chipContainer}>
          {item.currentOpeningHours?.openNow != null && (
            <Chip
              compact
              icon={item.currentOpeningHours.openNow ? "check" : "close"}
              selectedColor={colors.white}
              style={{
                backgroundColor: item.currentOpeningHours.openNow
                  ? colors.success
                  : colors.disabled,
              }}
            >
              {item.currentOpeningHours.openNow
                ? t("details.open_now")
                : t("details.closed")}
            </Chip>
          )}
          {typeof item.userRatingCount === "number" && (
            <Chip compact style={{ backgroundColor: colors.surface }}>{`${
              item.userRatingCount
            } ${t("details.reviews")}`}</Chip>
          )}
          {typeof item.rating === "number" && (
            <Badge style={styles.badge}>{item.rating.toFixed(1)}</Badge>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

export default SearchResultCard;

const createStyles = (colors) =>
  StyleSheet.create({
    card: {
      marginHorizontal: 12,
      marginVertical: 6,
      backgroundColor: colors.surface,
    },
    cardTitle: {
      title: {
        color: colors.text,
      },
      subtitle: {
        color: colors.textSecondary,
      },
    },
    badge: {
      backgroundColor: colors.accent,
      color: colors.black,
      paddingHorizontal: 8,
      borderRadius: 12,
    },
    chipContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    thumb: {
      width: 44,
      height: 44,
      borderRadius: 8,
      backgroundColor: colors.background,
      marginLeft: 8,
    },
    thumbIcon: {
      width: 44,
      height: 44,
      borderRadius: 8,
      backgroundColor: colors.background,
      marginLeft: 8,
      alignItems: "center",
      justifyContent: "center",
    },
  });
