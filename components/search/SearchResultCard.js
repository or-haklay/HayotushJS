import { Card, Chip, IconButton, Badge } from "react-native-paper";
import { StyleSheet, Linking } from "react-native";
import { COLORS } from "../../theme/theme";
import { View } from "react-native";
import { useRouter } from "expo-router";
import Fontisto from "@expo/vector-icons/Fontisto";
import { useTranslation } from "react-i18next";
import { t } from "i18next";

// בתוך ServiceDetailsScreen():

const router = useRouter();

const openMaps = (item) => {
  if (item.googleMapsUri) Linking.openURL(item.googleMapsUri);
  else if (item.id)
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        item.displayName?.text || ""
      )}&query_place_id=${item.id}`
    );
};

const goToDetails = (item) => {
  router.push({
    pathname: "/service/[id]",
    params: {
      id: item.id,
      name: item.displayName?.text || t("common.service"),
    },
  });
};

function renderItem({ item }) {
  const { t } = useTranslation();

  return (
    <Card style={styles.card} onPress={() => goToDetails(item)}>
      <Card.Title
        title={item.displayName?.text || t("common.no_name")}
        subtitle={`${item.formattedAddress || ""}${
          item._distanceM != null
            ? ` • ${(item._distanceM / 1000).toFixed(1)} km`
            : ""
        }`}
        titleStyle={styles.cardTitle.title}
        subtitleStyle={styles.cardTitle.subtitle}
        right={(props) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 15,
            }}
          >
            <Fontisto
              name="navigate"
              size={28}
              color={COLORS.primary}
              onPress={() => openMaps(item)}
            />
          </View>
        )}
      />
      <Card.Content>
        <View style={styles.chipContainer}>
          {item.currentOpeningHours?.openNow != null && (
            /*is opening  */
            <Chip
              compact
              icon={item.currentOpeningHours.openNow ? "check" : "close"}
              selectedColor={COLORS.white}
              style={{
                backgroundColor: item.currentOpeningHours.openNow
                  ? COLORS.success
                  : COLORS.disabled,
              }}
            >
              {item.currentOpeningHours.openNow
                ? t("details.open_now")
                : t("details.closed")}
            </Chip>
          )}
          {typeof item.userRatingCount === "number" && (
            /* review count */
            <Chip compact style={{ backgroundColor: COLORS.background }}>{`${
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
}

export default renderItem;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginVertical: 6,
    backgroundColor: COLORS.white,
  },
  cardTitle: {
    title: {
      color: COLORS.dark,
    },
    subtitle: {
      color: COLORS.neutral,
    },
  },
  badge: {
    backgroundColor: COLORS.accent,
    color: COLORS.black,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
});
