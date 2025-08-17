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

import { getPetById, deletePet } from "../../../../services/petService";
import { listExpenses } from "../../../../services/expensesService";
import { listReminders } from "../../../../services/remindersService";
import { listMedicalRecords } from "../../../../services/medicalRecordsService";
import { COLORS, FONTS } from "../../../../theme/theme";
import { isObjectId } from "../../../../utils/ids";
import { styles } from "./styles";

const PlaceholderImage = require("../../../../assets/images/dog-think.png");

// עזר קטן לחישוב גיל
function getAgeString(birthDateStr) {
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
  return years > 0 ? `${years}ש׳ ${months}ח׳` : `${months} ח׳`;
}

const PetProfile = () => {
  const params = useLocalSearchParams();
  const petId =
    typeof params.petId === "string"
      ? params.petId
      : Array.isArray(params.petId)
      ? params.petId[0]
      : null;

  const router = useRouter();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  // סטטיסטיקות/סטטוסים
  const [monthTotal, setMonthTotal] = useState(0);
  const [yearTotal, setYearTotal] = useState(0);
  const [lastExpense, setLastExpense] = useState(null);
  const [nextReminder, setNextReminder] = useState(null);
  const [lastMedical, setLastMedical] = useState(null);
  const [medCount, setMedCount] = useState(0);

  // Debug logging
  console.log("PetProfile params:", params);
  console.log("PetProfile petId:", petId);

  const load = useCallback(async () => {
    if (!petId) {
      console.log("No petId provided, cannot load pet data");
      return;
    }
    setLoading(true);
    try {
      // 1) פרטי חיה
      const p = await getPetById(petId);
      setPet(p);

      // 2) הוצאות: סיכום חודש נוכחי + שנה נוכחית + אחרונה
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
          limit: 200,
        }),
        listExpenses({
          petId,
          from: yearFrom,
          to: yearTo,
          sort: "date",
          order: "asc",
          limit: 200,
        }),
        listExpenses({ petId, sort: "date", order: "desc", limit: 1 }),
      ]);

      setMonthTotal(
        (monthRows || []).reduce(
          (s, r) => s + (Number(r.amount) || 0),
          0
        )
      );
      setYearTotal(
        (yearRows || []).reduce(
          (s, r) => s + (Number(r.amount) || 0),
          0
        )
      );
      setLastExpense((allRows || [])[0] || null);

      // 3) תזכורת קרובה
      const reminders = await listReminders({
        petId,
        onlyUpcoming: true,
        sort: "date",
        order: "asc",
        limit: 1,
      });
      setNextReminder((reminders || [])[0] || null);

      // 4) מסמך רפואי – אחרון וספירה
      const medicalRows = await listMedicalRecords({
        petId,
        sort: "date",
        order: "desc",
        limit: 20,
      });
      setMedCount(medicalRows?.length || 0);
      setLastMedical(medicalRows?.[0] || null);
    } catch (e) {
      setErr(e?.response?.data?.message || "שגיאה בטעינה");
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useFocusEffect(
    useCallback(() => {
      if (!isObjectId(petId)) return; // אל תטען סטטיסטיקות אם petId="new"

      load();
    }, [load])
  );

  const avatar = useMemo(() => {
    const letter = pet?.name?.[0]?.toUpperCase?.() || "?";
    return (
      <Avatar.Text
        size={56}
        label={letter}
        source={{ uri: pet?.profilePictureUrl }}
        style={{ backgroundColor: COLORS.primary }}
        color={COLORS.white}
      />
    );
  }, [pet]);

  const onDelete = () => {
    Alert.alert("מחיקת חיה", "למחוק את הרשומה וכל הנתונים הנלווים?", [
      { text: "ביטול" },
      {
        text: "מחק",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePet(petId);
            router.replace("/(tabs)/pets");
          } catch {
            setErr("מחיקה נכשלה");
          }
        },
      },
    ]);
  };

  const photoUrl = pet?.profilePictureUrl || pet?.photoUrl || pet?.imageUrl;

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Card */}
        <Card>
          {photoUrl ? (
            <Card.Cover source={{ uri: photoUrl }} style={styles.cardCover} />
          ) : (
            <Card.Cover source={PlaceholderImage} style={styles.cardCover} />
          )}
          <Card.Title
            title={pet?.name || "—"}
            subtitle={`${pet?.species || ""}${
              pet?.breed ? " • " + pet.breed : ""
            }`}
            right={(props) => (
              <View style={styles.cardActions}>
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
          <Card.Content style={styles.cardContent}>
            <View style={styles.chipContainer}>
              {pet?.sex ? (
                <Chip icon="gender-male-female">{pet.sex}</Chip>
              ) : null}
              {pet?.birthDate ? (
                <Chip icon="cake-variant">{getAgeString(pet.birthDate)}</Chip>
              ) : null}
              {pet?.weightKg ? (
                <Chip icon="scale">{pet.weightKg} ק״ג</Chip>
              ) : null}
              {pet?.color ? <Chip icon="palette">{pet.color}</Chip> : null}
              {pet?.chipNumber ? (
                <Chip icon="chip">{pet.chipNumber}</Chip>
              ) : null}
            </View>
            {pet?.notes ? (
              <Text style={styles.notes}>
                <Text numberOfLines={3}>{pet.notes[0]}</Text>
              </Text>
            ) : null}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button
            mode="contained"
            onPress={() =>
              router.push({
                pathname: "/pets/[petId]/expenses",
                params: { petId },
              })
            }
          >
            הוצאות
          </Button>
          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={() =>
                router.push({
                  pathname: "/pets/[petId]/expenses/new",
                  params: { petId },
                })
              }
              style={styles.halfButton}
            >
              הוסף הוצאה
            </Button>
            <Button
              mode="outlined"
              onPress={() =>
                router.push({
                  pathname: "/pets/[petId]/expenses/summary",
                  params: { petId },
                })
              }
              style={styles.halfButton}
            >
              סיכום הוצאות
            </Button>
          </View>

          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={() =>
                router.push({
                  pathname: "/pets/[petId]/medical-records",
                  params: { petId },
                })
              }
              style={styles.halfButton}
            >
              מסמכים רפואיים
            </Button>
            <Button
              mode="outlined"
              onPress={() =>
                router.push({
                  pathname: "/pets/[petId]/medical-records/new",
                  params: { petId },
                })
              }
              style={styles.halfButton}
            >
              הוסף מסמך
            </Button>
          </View>

          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={() =>
                router.push({
                  pathname: "/pets/[petId]/reminders",
                  params: { petId },
                })
              }
              style={styles.halfButton}
            >
              תזכורות
            </Button>
            <Button
              mode="outlined"
              onPress={() =>
                router.push({
                  pathname: "/pets/[petId]/reminders/new",
                  params: { petId },
                })
              }
              style={styles.halfButton}
            >
              הוסף תזכורת
            </Button>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Status & Stats */}
        <Card>
          <List.Section>
            <List.Subheader>סטטוס</List.Subheader>

            <List.Item
              title="הוצאה אחרונה"
              description={
                lastExpense
                  ? `${new Date(lastExpense.date).toLocaleDateString(
                      "he-IL"
                    )} • ${lastExpense.category} • ${Number(
                      lastExpense.amount
                    ).toFixed(0)}₪`
                  : "—"
              }
              left={(props) => <List.Icon {...props} icon="cash" />}
              right={(props) =>
                lastExpense ? (
                  <Badge {...props}>
                    {Number(lastExpense.amount).toFixed(0)}₪
                  </Badge>
                ) : null
              }
            />

            <List.Item
              title="תזכורת הבאה"
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
              title="מסמך רפואי אחרון"
              description={
                lastMedical
                  ? `${new Date(lastMedical.date).toLocaleDateString(
                      "he-IL"
                    )} • ${lastMedical.recordName}`
                  : `— (${medCount} סה״כ)`
              }
              left={(props) => <List.Icon {...props} icon="file-document" />}
              right={(props) =>
                medCount ? <Badge {...props}>{medCount}</Badge> : null
              }
            />

            <Divider style={styles.listDivider} />

            <List.Item
              title="סה״כ חודש נוכחי"
              description={`${new Date().toLocaleString("he-IL", {
                month: "long",
              })}`}
              left={(props) => <List.Icon {...props} icon="calendar-month" />}
              right={(props) => (
                <Text style={styles.monthTotal}>{monthTotal.toFixed(0)}₪</Text>
              )}
            />

            <List.Item
              title="סה״כ השנה"
              description={`${new Date().getFullYear()}`}
              left={(props) => <List.Icon {...props} icon="calendar" />}
              right={(props) => (
                <Text style={styles.yearTotal}>{yearTotal.toFixed(0)}₪</Text>
              )}
            />
          </List.Section>
        </Card>
      </ScrollView>

      <Snackbar
        visible={!!err}
        onDismiss={() => setErr("")}
        duration={2500}
        style={styles.snackbar}
      >
        {err}
      </Snackbar>
    </View>
  );
};

export default PetProfile;