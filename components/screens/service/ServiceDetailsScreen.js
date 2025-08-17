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
import placesService from "../../../services/placesService";
import config from "../../../config.json";
import { COLORS } from "../../../theme/theme";
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

const ServiceDetailsScreen = () => {
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
          renderItem={({ item: photo }) => (
            <Image
              source={{ uri: absolutePhoto(photo.name) || "" }}
              style={{ width: 300, height: 200, marginRight: 8 }}
              resizeMode="cover"
            />
          )}
        />

        {/* Basic info card */}
        <Card style={{ margin: 16 }}>
          <Card.Content>
            <Text variant="headlineSmall" style={{ marginBottom: 8 }}>
              {title}
            </Text>
            {details.rating && (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <Text variant="bodyMedium">Rating: {details.rating}/5</Text>
                <Badge style={{ marginLeft: 8 }}>{details.rating}</Badge>
              </View>
            )}
            {details.formattedAddress && (
              <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
                {details.formattedAddress}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Action buttons */}
        <View style={{ flexDirection: "row", justifyContent: "space-around", margin: 16 }}>
          <Button mode="contained" onPress={handleCall} icon="phone">
            Call
          </Button>
          <Button mode="contained" onPress={handleWebsite} icon="web">
            Website
          </Button>
          <Button mode="contained" onPress={handleMessage} icon="message">
            Message
          </Button>
          <Button mode="contained" onPress={handleNavigate} icon="navigation">
            Navigate
          </Button>
        </View>

        <Divider style={{ margin: 16 }} />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={title} />
      </Appbar.Header>

      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={Header}
        ListEmptyComponent={
          <View style={{ padding: 16 }}>
            <Text>No additional details available</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default ServiceDetailsScreen;
