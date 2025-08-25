import React, { useCallback, useMemo, useState } from "react";
import { View, ScrollView, RefreshControl, Alert } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import {
  Text,
  Card,
  List,
  Button,
  Chip,
  Avatar,
  IconButton,
  Divider,
  Snackbar,
  Badge,
} from "react-native-paper";

import { petService } from "../../services/petService";
import { listExpenses } from "../../services/expensesService";
import { listReminders } from "../../services/remindersService";
import { listMedicalRecords } from "../../services/medicalRecordsService";
import { COLORS, FONTS } from "../../theme/theme";
import { useTranslation } from "react-i18next";

const PlaceholderImage = require("../../assets/images/dogs/dog-think.png");
const isObjectId = (v) => typeof v === "string" && /^[0-9a-fA-F]{24}$/.test(v);

// העברת הפונקציה לתוך הקומפוננטה כדי ש-t יהיה זמין

export default function PetProfile() {
  const { petId } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  // העברת הפונקציה לתוך הקומפוננטה כדי ש-t יהיה זמין
  const getAgeString = useCallback(
    (birthDateStr) => {
      if (!birthDateStr) return "—";
      const d = new Date(birthDateStr);
      if (Number.isNaN(d.getTime())) return "—";
      const now = new Date();
      let years = now.getFullYear() - d.getFullYear();
      let months = now.getMonth() - d.getMonth();
      if (months < 0) {
        years--;
        months += 12;
      }
      return years > 0
        ? `${years}${t("common.years")} ${months}${t("common.months")}`
        : `${months} ${t("common.months")}`;
    },
    [t]
  );

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [monthTotal, setMonthTotal] = useState(0);
  const [yearTotal, setYearTotal] = useState(0);
  const [lastExpense, setLastExpense] = useState(null);
  const [nextReminder, setNextReminder] = useState(null);
  const [lastMedical, setLastMedical] = useState(null);
  const [medCount, setMedCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = await petService.getPetById(petId);
      setPet(p);

      const now = new Date();
      const y = now.getFullYear();
      const monthFrom = new Date(y, now.getMonth(), 1).toISOString();
      const monthTo = new Date(
        y,
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      ).toISOString();
      const yearFrom = new Date(y, 0, 1).toISOString();
      const yearTo = new Date(y, 11, 31, 23, 59, 59, 999).toISOString();

      const [monthRows, yearRows, allRows] = await Promise.all([
        listExpenses({
          petId,
          from: monthFrom,
          to: monthTo,
          sort: "date",
          order: "asc",
          limit: 500,
        }),
        listExpenses({
          petId,
          from: yearFrom,
          to: yearTo,
          sort: "date",
          order: "asc",
          limit: 5000,
        }),
        listExpenses({ petId, sort: "date", order: "desc", limit: 1 }),
      ]);

      setMonthTotal(
        (monthRows || []).reduce((s, r) => s + (Number(r.amount) || 0), 0)
      );
      setYearTotal(
        (yearRows || []).reduce((s, r) => s + (Number(r.amount) || 0), 0)
      );
      setLastExpense((allRows || [])[0] || null);

      const reminders = await listReminders({
        petId,
        onlyUpcoming: true,
        sort: "date",
        order: "asc",
        limit: 1,
      });
      setNextReminder((reminders || [])[0] || null);

      const medicalRows = await listMedicalRecords({
        petId,
        sort: "date",
        order: "desc",
        limit: 20,
      });
      setMedCount(medicalRows?.length || 0);
      setLastMedical(medicalRows?.[0] || null);
    } catch (e) {
      setErr(e?.response?.data?.message || t("pets.load_error"));
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useFocusEffect(
    useCallback(() => {
      if (!isObjectId(petId)) return;
      load();
    }, [load, petId])
  );

  const photoUrl =
    pet?.profilePictureUrl || pet?.photoUrl || pet?.imageUrl || null;
  const avatar = useMemo(() => {
    const letter = pet?.name?.[0]?.toUpperCase?.() || "?";
    if (photoUrl) {
      return (
        <Avatar.Image
          size={56}
          source={{ uri: photoUrl }}
          defaultSource={require("../../assets/images/dogs/dog-think.png")}
          onError={(error) => {
            console.log("Error loading pet profile image:", error);
          }}
          onLoad={() => {
            console.log("Pet profile image loaded successfully");
          }}
        />
      );
    } else {
      // תמונת ברירת מחדל לפי סוג החיה
      if (pet?.species === "cat") {
        return (
          <Avatar.Image
            size={56}
            source={require("../../assets/images/cats/cat-sit.png")}
          />
        );
      } else {
        return (
          <Avatar.Image
            size={56}
            source={require("../../assets/images/dogs/dog-sit.png")}
          />
        );
      }
    }
  }, [pet, photoUrl]);

  const onDelete = () => {
    Alert.alert(t("pets.delete_title"), t("pets.delete_message"), [
      { text: t("action.cancel") },
      {
        text: t("pets.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await petService.deletePet(petId);
            router.replace("/(tabs)/home");
          } catch {
            setErr(t("pets.delete_error"));
          }
        },
      },
    ]);
  };

  // פונקציה לטעינה מחדש של הפרופיל אחרי שינוי תמונה
  const refreshPetAfterImageChange = useCallback(async () => {
    try {
      await load();
    } catch (error) {
      console.error("Error refreshing pet after image change:", error);
    }
  }, [load]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      >
        <Card>
          {photoUrl ? (
            <Card.Cover
              source={{ uri: photoUrl }}
              style={{ height: 200, backgroundColor: COLORS.white }}
            />
          ) : (
            <Card.Cover
              source={PlaceholderImage}
              style={{ height: 200, backgroundColor: COLORS.white }}
            />
          )}
          <Card.Title
            title={pet?.name || "—"}
            subtitle={`${pet?.species || ""}${
              pet?.breed ? " • " + pet.breed : ""
            }`}
            left={() => avatar}
            right={(props) => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <IconButton
                  {...props}
                  icon="pencil"
                  onPress={() =>
                    router.push({ pathname: "/pets/new", params: { petId } })
                  }
                />
                <IconButton {...props} icon="delete" onPress={onDelete} />
              </View>
            )}
          />
          <Card.Content style={{ gap: 8, marginBottom: 8 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {pet?.sex ? (
                <Chip icon="gender-male-female">{pet.sex}</Chip>
              ) : null}
              {pet?.birthDate ? (
                <Chip icon="cake-variant">{getAgeString(pet.birthDate)}</Chip>
              ) : null}
              {pet?.weightKg ? (
                <Chip icon="scale">
                  {pet.weightKg} {t("common.kg")}
                </Chip>
              ) : null}
              {pet?.color ? <Chip icon="palette">{pet.color}</Chip> : null}
              {pet?.chipNumber ? (
                <Chip icon="chip">{pet.chipNumber}</Chip>
              ) : null}
            </View>
            {pet?.notes ? (
              <Text
                style={[FONTS.body, { marginTop: 4, color: COLORS.neutral }]}
                numberOfLines={3}
              >
                {pet.notes}
              </Text>
            ) : null}
          </Card.Content>
        </Card>

        <View style={{ marginTop: 12, gap: 8 }}>
          <Button
            mode="contained"
            onPress={() =>
              router.push({
                pathname: "/pets/[petId]/expenses",
                params: { petId },
              })
            }
          >
            {t("pets.expenses")}
          </Button>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button
              mode="outlined"
              onPress={() =>
                router.push({
                  pathname: "/pets/[petId]/expenses/new",
                  params: { petId },
                })
              }
              style={{ flex: 1 }}
            >
              {t("pets.add_expense")}
            </Button>
            <Button
              mode="outlined"
              onPress={() =>
                router.push({
                  pathname: "/pets/[petId]/expenses/summary",
                  params: { petId },
                })
              }
              style={{ flex: 1 }}
            >
              {t("pets.expenses_summary")}
            </Button>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button
              mode="outlined"
              onPress={() =>
                router.push({
                  pathname: "/pets/[petId]/medical-records",
                  params: { petId },
                })
              }
              style={{ flex: 1 }}
            >
              {t("pets.medical_records")}
            </Button>
            <Button
              mode="outlined"
              onPress={() =>
                router.push({
                  pathname: "/pets/[petId]/medical-records/new",
                  params: { petId },
                })
              }
              style={{ flex: 1 }}
            >
              {t("pets.add_medical_record")}
            </Button>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button
              mode="outlined"
              onPress={() =>
                router.push({
                  pathname: "/pets/[petId]/reminders",
                  params: { petId },
                })
              }
              style={{ flex: 1 }}
            >
              {t("pets.reminders")}
            </Button>
            <Button
              mode="outlined"
              onPress={() =>
                router.push({
                  pathname: "/pets/[petId]/reminders/new",
                  params: { petId },
                })
              }
              style={{ flex: 1 }}
            >
              {t("pets.add_reminder")}
            </Button>
          </View>
        </View>

        <Divider style={{ marginVertical: 16 }} />

        <Card>
          <List.Section>
            <List.Subheader>{t("pets.status")}</List.Subheader>

            <List.Item
              title={t("pets.last_expense")}
              description={
                lastExpense
                  ? `${new Date(lastExpense.date).toLocaleDateString(
                      "he-IL"
                    )} • ${lastExpense.category} • ${Number(
                      lastExpense.amount
                    ).toFixed(0)}${t("common.currency")}`
                  : "—"
              }
              left={(props) => <List.Icon {...props} icon="cash" />}
              right={(props) =>
                lastExpense ? (
                  <Badge {...props}>
                    {Number(lastExpense.amount).toFixed(0)}
                    {t("common.currency")}
                  </Badge>
                ) : null
              }
            />

            <List.Item
              title={t("pets.next_reminder")}
              description={
                nextReminder
                  ? `${new Date(nextReminder.date).toLocaleString("he-IL")} • ${
                      nextReminder.title
                    }`
                  : "—"
              }
              left={(props) => <List.Icon {...props} icon="bell" />}
            />

            <List.Item
              title={t("pets.last_medical_record")}
              description={
                lastMedical
                  ? `${new Date(lastMedical.date).toLocaleDateString(
                      "he-IL"
                    )} • ${lastMedical.recordName}`
                  : `— (${medCount} ${t("pets.total")})`
              }
              left={(props) => <List.Icon {...props} icon="file-document" />}
              right={(props) =>
                medCount ? <Badge {...props}>{medCount}</Badge> : null
              }
            />

            <Divider style={{ marginVertical: 8 }} />

            <List.Item
              title={t("pets.monthly_total")}
              description={`${new Date().toLocaleString("he-IL", {
                month: "long",
              })}`}
              left={(props) => <List.Icon {...props} icon="calendar-month" />}
              right={(props) => (
                <Text style={[FONTS.h3, { color: COLORS.primary }]}>
                  {monthTotal.toFixed(0)}
                  {t("common.currency")}
                </Text>
              )}
            />

            <List.Item
              title={t("pets.yearly_total")}
              description={`${new Date().getFullYear()}`}
              left={(props) => <List.Icon {...props} icon="calendar" />}
              right={(props) => (
                <Text style={[FONTS.h3, { color: COLORS.primary }]}>
                  {yearTotal.toFixed(0)}
                  {t("common.currency")}
                </Text>
              )}
            />
          </List.Section>
        </Card>
      </ScrollView>

      <Snackbar
        visible={!!err}
        onDismiss={() => setErr("")}
        duration={2500}
        style={{ backgroundColor: COLORS.error }}
      >
        {err}
      </Snackbar>
    </View>
  );
}
