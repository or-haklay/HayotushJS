import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Modal,
  ImageBackground,
} from "react-native";
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
  Portal,
  Dialog,
  TextInput,
} from "react-native-paper";
import { SIZING } from "../../../theme/theme";

import petService from "../../../services/petService";
import { listExpenses } from "../../../services/expensesService";
import { listReminders } from "../../../services/remindersService";
import { listMedicalRecords } from "../../../services/medicalRecordsService";
import uploadService from "../../../services/uploadService";
import { COLORS, FONTS } from "../../../theme/theme";
import { useTranslation } from "react-i18next";

const PlaceholderImageDog = require("../../../assets/images/dogs/dog-play.png");
const PlaceholderImageCat = require("../../../assets/images/cats/cat-play.png");
const CoverPlaceholder = require("../../../assets/images/cover.png");
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
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // מצב לעריכת תמונות
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [imageType, setImageType] = useState(null); // 'profile' או 'cover'
  const [selectedImage, setSelectedImage] = useState(null);

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

  const photoUrl = pet?.profilePictureUrl || null;
  const coverUrl = pet?.coverPictureUrl || null;
  const avatar = useMemo(() => {
    const letter = pet?.name?.[0]?.toUpperCase?.() || "?";
    if (photoUrl) {
      return (
        <TouchableOpacity onPress={() => openImageOptions("profile")}>
          <View style={{ position: "relative" }}>
            <Avatar.Image
              size={56}
              source={{ uri: photoUrl }}
              defaultSource={
                pet?.species === "cat"
                  ? PlaceholderImageCat
                  : PlaceholderImageDog
              }
              onError={(error) => {
                console.error("Error loading pet profile image:", error);
              }}
              onLoad={() => {
                // תמונה נטענה בהצלחה
              }}
            />
            <View
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                backgroundColor: COLORS.primary,
                borderRadius: 12,
                width: 24,
                height: 24,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconButton
                icon="camera"
                size={16}
                iconColor={COLORS.white}
                style={{ margin: 0 }}
              />
            </View>
          </View>
        </TouchableOpacity>
      );
    } else {
      // תמונת ברירת מחדל לפי סוג החיה
      if (pet?.species === "cat") {
        return (
          <TouchableOpacity onPress={() => openImageOptions("profile")}>
            <View style={{ position: "relative" }}>
              <Avatar.Image
                size={56}
                source={require("../../../assets/images/cats/cat-sit.png")}
              />
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: COLORS.primary,
                  borderRadius: 12,
                  width: 24,
                  height: 24,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconButton
                  icon="camera"
                  size={16}
                  iconColor={COLORS.white}
                  style={{ margin: 0 }}
                />
              </View>
            </View>
          </TouchableOpacity>
        );
      } else {
        return (
          <TouchableOpacity onPress={() => openImageOptions("profile")}>
            <View style={{ position: "relative" }}>
              <Avatar.Image
                size={56}
                source={require("../../../assets/images/dogs/dog-sit.png")}
              />
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: COLORS.primary,
                  borderRadius: 12,
                  width: 24,
                  height: 24,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconButton
                  icon="camera"
                  size={16}
                  iconColor={COLORS.white}
                  style={{ margin: 0 }}
                />
              </View>
            </View>
          </TouchableOpacity>
        );
      }
    }
  }, [pet, photoUrl, coverUrl]);

  const onDelete = () => {
    setDeleteDialogVisible(true);
    setDeleteConfirmText("");
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmText.trim() !== pet?.name) {
      setErr(t("pets.delete_confirm_name_mismatch"));
      return;
    }

    try {
      await petService.deletePet(petId);
      setDeleteDialogVisible(false);
      router.replace("/(tabs)/home");
    } catch {
      setErr(t("pets.delete_error"));
    }
  };

  const onUpdateProfilePicture = async (imageUri) => {
    try {
      if (!imageUri) return;

      // עדכן את התמונה בשרת
      await petService.updatePetProfilePicture(petId, imageUri);

      // טען מחדש את הנתונים
      await load();

      Alert.alert(t("common.success"), t("pets.profile_picture_updated"));
    } catch (error) {
      console.error("Error updating pet profile picture:", error);
      Alert.alert(t("common.error"), t("pets.profile_picture_update_error"));
    }
  };

  // פונקציה לטעינה מחדש של הפרופיל אחרי שינוי תמונה
  const refreshPetAfterImageChange = useCallback(async () => {
    try {
      await load();
    } catch (error) {
      console.error("Error refreshing pet after image change:", error);
    }
  }, [load]);

  // פונקציות לעריכת תמונות
  const handlePickImage = async () => {
    let image;

    try {
      if (imageType === "profile") {
        image = await uploadService.pickProfileImage();
      } else if (imageType === "cover") {
        image = await uploadService.pickCoverImage();
      }

      if (image) {
        setSelectedImage(image);
        setShowImageOptions(false);

        try {
          let uploadResult;
          if (imageType === "profile") {
            uploadResult = await uploadService.uploadPetPicture(image);
          } else if (imageType === "cover") {
            uploadResult = await uploadService.uploadPetCoverPicture(image);
          }

          if (uploadResult && uploadResult.success) {
            // עדכון בשרת
            if (imageType === "profile") {
              await petService.updatePetProfilePicture(
                petId,
                uploadResult.fileUrl
              );
            } else if (imageType === "cover") {
              await petService.updatePetCoverPicture(
                petId,
                uploadResult.fileUrl
              );
            }

            // רענון נתונים מהשרת
            await refreshPetAfterImageChange();

            // נקה את התמונה המקומית
            setSelectedImage(null);
            setImageType(null);

            Alert.alert(
              t("common.success"),
              t("pets.image_updated_successfully", {
                type:
                  imageType === "profile" ? t("pets.profile") : t("pets.cover"),
              })
            );
          }
        } catch (error) {
          Alert.alert(t("common.error"), t("pets.image_upload_error"));
          console.error("Error uploading pet image:", error);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(t("common.error"), t("pets.image_pick_error"));
    }
  };

  const handleRemoveImage = async () => {
    const imageTypeText =
      imageType === "profile" ? t("pets.profile") : t("pets.cover");

    Alert.alert(
      t("pets.remove_image_title", { type: imageTypeText }),
      t("pets.remove_image_message", { type: imageTypeText }),
      [
        { text: t("action.cancel"), style: "cancel" },
        {
          text: t("pets.remove"),
          style: "destructive",
          onPress: async () => {
            try {
              // עדכון בשרת - שליחת ערך ריק במקום מחרוזת ריקה
              if (imageType === "profile") {
                await petService.updatePetProfilePicture(petId, null);
              } else if (imageType === "cover") {
                await petService.updatePetCoverPicture(petId, null);
              }

              // רענון נתונים מהשרת
              await refreshPetAfterImageChange();

              setShowImageOptions(false);
              setImageType(null);

              Alert.alert(
                t("common.success"),
                t("pets.image_removed_successfully", { type: imageTypeText })
              );
            } catch (error) {
              Alert.alert(t("common.error"), t("pets.image_remove_error"));
              console.error("Error removing pet image:", error);
            }
          },
        },
      ]
    );
  };

  const openImageOptions = (type) => {
    setImageType(type);
    setShowImageOptions(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      >
        <Card>
          {coverUrl ? (
            <TouchableOpacity onPress={() => openImageOptions("cover")}>
              <View style={{ position: "relative" }}>
                <Card.Cover
                  source={{ uri: coverUrl }}
                  style={{ height: 200, backgroundColor: COLORS.white }}
                />
                <View
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: COLORS.primary,
                    borderRadius: 16,
                    width: 32,
                    height: 32,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconButton
                    icon="camera"
                    size={20}
                    iconColor={COLORS.white}
                    style={{ margin: 0 }}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => openImageOptions("cover")}>
              <View style={{ position: "relative" }}>
                <Card.Cover
                  source={CoverPlaceholder}
                  style={{ height: 200, backgroundColor: COLORS.white }}
                />
                <View
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: COLORS.primary,
                    borderRadius: 16,
                    width: 32,
                    height: 32,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconButton
                    icon="camera"
                    size={20}
                    iconColor={COLORS.white}
                    style={{ margin: 0 }}
                  />
                </View>
              </View>
            </TouchableOpacity>
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

      {/* Image Options Modal */}
      <Portal>
        <Dialog
          visible={showImageOptions}
          onDismiss={() => setShowImageOptions(false)}
        >
          <Dialog.Title>
            {imageType === "profile"
              ? t("pets.profile_image_options")
              : t("pets.cover_image_options")}
          </Dialog.Title>
          <Dialog.Content>
            <View style={{ padding: 16 }}>
              <Button
                mode="contained"
                onPress={handlePickImage}
                icon="camera"
                style={{ marginBottom: 16 }}
              >
                {imageType === "profile"
                  ? pet?.profilePictureUrl
                    ? t("pets.change_image")
                    : t("pets.choose_image")
                  : pet?.coverPictureUrl
                  ? t("pets.change_image")
                  : t("pets.choose_image")}
              </Button>

              {(imageType === "profile" && pet?.profilePictureUrl) ||
              (imageType === "cover" && pet?.coverPictureUrl) ? (
                <Button
                  mode="outlined"
                  onPress={handleRemoveImage}
                  icon="delete"
                  textColor={COLORS.error}
                  style={{ marginBottom: 16 }}
                >
                  {t("pets.remove_image")}
                </Button>
              ) : null}

              <Button
                mode="outlined"
                onPress={() => setShowImageOptions(false)}
              >
                {t("action.cancel")}
              </Button>
            </View>
          </Dialog.Content>
        </Dialog>
      </Portal>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>{t("pets.delete_confirm_title")}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
              {t("pets.delete_confirm_message", { petName: pet?.name })}
            </Text>
            <TextInput
              label={t("pets.delete_confirm_input_label")}
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              placeholder={t("pets.delete_confirm_input_placeholder")}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>
              {t("pets.delete_confirm_cancel")}
            </Button>
            <Button
              mode="contained"
              buttonColor={COLORS.error}
              onPress={handleDeleteConfirm}
              disabled={deleteConfirmText.trim() !== pet?.name}
            >
              {t("pets.delete_confirm_delete")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
