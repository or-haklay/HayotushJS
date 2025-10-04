import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Modal,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Text,
  TextInput,
  Button,
  HelperText,
  ActivityIndicator,
  Avatar,
  Chip,
  Divider,
  List,
  Portal,
  Dialog,
  IconButton,
} from "react-native-paper";
import Joi from "joi";
import { COLORS, FONTS, SIZING } from "../../theme/theme";
import userService from "../../services/userService";
import petService from "../../services/petService";
import * as gamificationService from "../../services/gamificationService";
import { useTranslation } from "react-i18next";
import uploadService from "../../services/uploadService";

const dateToISO = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");
const safeNum = (v) =>
  v === "" || v === null || v === undefined ? undefined : Number(v);
const fmt = (v) =>
  v === undefined || v === null || v === "" ? "—" : String(v);

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // העברת ה-schemas לתוך הקומפוננטה כדי ש-t יהיה זמין
  const profileSchema = useMemo(
    () =>
      Joi.object({
        name: Joi.string()
          .min(2)
          .required()
          .messages({
            "string.empty": t("profile.name_required"),
            "string.min": t("profile.name_min_error"),
          }),
        email: Joi.string()
          .email({ tlds: { allow: false } })
          .required()
          .messages({
            "string.empty": t("profile.email_required"),
            "string.email": t("profile.email_invalid"),
          }),
        phone: Joi.string()
          .allow("", null)
          .pattern(/^[0-9+\-()\s]*$/)
          .messages({
            "string.pattern.base": t("profile.phone_pattern_error"),
          }),
        bio: Joi.string()
          .allow("", null)
          .max(280)
          .messages({ "string.max": t("profile.bio_max_error") }),
        profilePicture: Joi.string()
          .uri({ allowRelative: false })
          .allow("", null)
          .messages({ "string.uri": t("profile.url_error") }),
        dateOfBirth: Joi.string()
          .allow("", null)
          .pattern(/^\d{4}-\d{2}-\d{2}$/)
          .messages({ "string.pattern.base": t("profile.date_format_error") }),
        address: Joi.object({
          street: Joi.string().allow("", null),
          city: Joi.string().allow("", null),
          country: Joi.string().allow("", null),
          houseNumber: Joi.alternatives().try(
            Joi.number().integer().min(0),
            Joi.allow("", null)
          ),
          zipCode: Joi.alternatives().try(
            Joi.number().integer().min(0),
            Joi.allow("", null)
          ),
        }),
      }),
    [t]
  );

  const passwordSchema = useMemo(
    () =>
      Joi.object({
        currentPassword: Joi.string()
          .required()
          .messages({ "string.empty": t("profile.current_password_required") }),
        newPassword: Joi.string()
          .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
          .required()
          .messages({
            "string.pattern.base": t("profile.new_password_pattern"),
            "string.empty": t("profile.new_password_required"),
          }),
        confirmPassword: Joi.any()
          .valid(Joi.ref("newPassword"))
          .required()
          .messages({
            "any.only": t("profile.confirm_password_mismatch"),
            "any.required": t("profile.confirm_password_required"),
          }),
      }),
    [t]
  );

  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pets, setPets] = useState([]);
  const [gSummary, setGSummary] = useState(null);
  const last7 = useMemo(() => {
    const arr = Array.isArray(gSummary?.last7Days) ? gSummary.last7Days : [];
    const todayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
    return arr
      .slice()
      .reverse()
      .map((day, index) => ({
        ...day,
        isToday: day.dateKey === todayKey,
        isFirst: index === 0,
      }));
  }, [gSummary]);
  const EDITABLE_KEYS = [
    "name",
    "email",
    "phone",
    "bio",
    "profilePicture",
    "dateOfBirth",
    "address",
  ];
  const pickEditable = (obj) => {
    const out = {};
    for (const k of EDITABLE_KEYS) if (obj[k] !== undefined) out[k] = obj[k];
    return out;
  };
  const [original, setOriginal] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    profilePicture: "",
    dateOfBirth: "",
    address: {
      street: "",
      city: "",
      country: "",
      houseNumber: "",
      zipCode: "",
    },
    subscriptionPlan: "free",
    subscriptionExpiresAt: null,
    isAdmin: false,
    googleId: null,
    facebookId: null,
    lastActive: null,
    createdAt: null,
    updatedAt: null,
  });
  const [errors, setErrors] = useState({});

  const [pwd, setPwd] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwdErrors, setPwdErrors] = useState({});

  // NEW: view/edit + password toggle
  const [editMode, setEditMode] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const handlePickImage = async () => {
    const image = await uploadService.pickImage();
    if (image) {
      setSelectedImage(image);
      setShowImageOptions(false);

      // העלאה ושמירה מיידית ללא קשר למצב עריכה
      try {
        const uploadResult = await uploadService.uploadProfilePicture(image);
        if (uploadResult && uploadResult.success) {
          // עדכון ה-URL בטופס
          setForm((prev) => ({
            ...prev,
            profilePicture: uploadResult.fileUrl,
          }));
          // עדכון בשרת
          await userService.updateProfile({
            profilePicture: uploadResult.fileUrl,
          });
          // רענון נתוני פרופיל מהמחשב
          await refreshProfileAfterImageChange();
          // נקה את התמונה המקומית כדי להציג את ה-URL מהשרת
          setSelectedImage(null);
          Alert.alert(
            t("profile.image_upload_success"),
            t("profile.image_upload_success")
          );
        }
      } catch (error) {
        Alert.alert(
          t("profile.image_upload_error"),
          t("profile.image_upload_error")
        );
        console.error("Error uploading profile picture:", error);
      }
    }
  };

  const handleRemoveProfilePicture = async () => {
    Alert.alert(
      t("profile.remove_picture.title"),
      t("profile.remove_picture.message"),
      [
        { text: t("profile.remove_picture.cancel"), style: "cancel" },
        {
          text: t("profile.remove_picture.remove"),
          style: "destructive",
          onPress: async () => {
            try {
              setForm((f) => ({ ...f, profilePicture: "" }));
              setSelectedImage(null);
              setShowImageOptions(false);
              // אם יש תמונה קיימת, נמחק אותה מהשרת
              if (original?.profilePicture) {
                // כאן אפשר להוסיף קריאה לשרת למחיקת התמונה
                // await uploadService.deleteProfilePicture();
              }
              // עדכן את הפרופיל בשרת
              await userService.updateProfile({ profilePicture: "" });
              await refreshProfileAfterImageChange();
              Alert.alert(
                t("profile.remove_picture.success"),
                t("profile.remove_picture.success")
              );
            } catch (error) {
              Alert.alert(
                t("profile.remove_picture.error"),
                t("profile.remove_picture.error")
              );
              console.error("Error removing profile picture:", error);
            }
          },
        },
      ]
    );
  };

  const getProfileImageSource = () => {
    if (selectedImage?.uri) {
      return { uri: selectedImage.uri };
    }
    if (form.profilePicture) {
      return { uri: form.profilePicture };
    }
    return require("../../assets/images/avatars/default-avatar-profile.png");
  };

  // פונקציה לטעינה מחדש של הפרופיל
  const reloadProfile = useCallback(async () => {
    try {
      const me = await userService.getMe();
      setOriginal(me);
      setForm({
        name: me.name || "",
        email: me.email || "",
        phone: me.phone || "",
        bio: me.bio || "",
        profilePicture: me.profilePicture || "",
        dateOfBirth: dateToISO(me.dateOfBirth),
        address: {
          street: me.address?.street || "",
          city: me.address?.city || "",
          country: me.address?.country || "",
          houseNumber:
            me.address?.houseNumber != null
              ? String(me.address.houseNumber)
              : "",
          zipCode:
            me.address?.zipCode != null ? String(me.address.zipCode) : "",
        },
        subscriptionPlan: me.subscriptionPlan || "free",
        subscriptionExpiresAt: me.subscriptionExpiresAt || null,
        isAdmin: !!me.isAdmin,
        googleId: me.googleId || null,
        facebookId: me.facebookId || null,
        lastActive: me.lastActive || null,
        createdAt: me.createdAt || null,
        updatedAt: me.updatedAt || null,
      });

      // נקה את התמונה הנבחרת אם יש תמונה בשרת
      if (me.profilePicture) {
        setSelectedImage(null);
      }
    } catch (e) {
      console.error("Failed to reload profile", e);
    }
  }, []);

  // פונקציה לטעינה מחדש של הפרופיל אחרי שינוי תמונה
  const refreshProfileAfterImageChange = useCallback(async () => {
    try {
      await reloadProfile();
      // עדכן את הממשק
      setEditMode(false);
      setErrors({});
    } catch (error) {
      console.error("Error refreshing profile after image change:", error);
    }
  }, [reloadProfile]);

  const isDirty = useMemo(() => {
    if (!original) return false;
    return (
      JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        bio: form.bio,
        profilePicture: form.profilePicture,
        dateOfBirth: form.dateOfBirth,
        address: form.address,
      }) !==
      JSON.stringify({
        name: original.name || "",
        email: original.email || "",
        phone: original.phone || "",
        bio: original.bio || "",
        profilePicture: original.profilePicture || "",
        dateOfBirth: dateToISO(original.dateOfBirth) || "",
        address: {
          street: original.address?.street || "",
          city: original.address?.city || "",
          country: original.address?.country || "",
          houseNumber: String(original.address?.houseNumber ?? ""),
          zipCode: String(original.address?.zipCode ?? ""),
        },
      })
    );
  }, [form, original]);

  useEffect(() => {
    (async () => {
      try {
        const me = await userService.getMe();
        setOriginal(me);
        setForm({
          name: me.name || "",
          email: me.email || "",
          phone: me.phone || "",
          bio: me.bio || "",
          profilePicture: me.profilePicture || "",
          dateOfBirth: dateToISO(me.dateOfBirth),
          address: {
            street: me.address?.street || "",
            city: me.address?.city || "",
            country: me.address?.country || "",
            houseNumber:
              me.address?.houseNumber != null
                ? String(me.address.houseNumber)
                : "",
            zipCode:
              me.address?.zipCode != null ? String(me.address.zipCode) : "",
          },
          subscriptionPlan: me.subscriptionPlan || "free",
          subscriptionExpiresAt: me.subscriptionExpiresAt || null,
          isAdmin: !!me.isAdmin,
          googleId: me.googleId || null,
          facebookId: me.facebookId || null,
          lastActive: me.lastActive || null,
          createdAt: me.createdAt || null,
          updatedAt: me.updatedAt || null,
        });
        try {
          const myPets = await petService.getMyPets();
          setPets(Array.isArray(myPets) ? myPets : []);
        } catch {}
        try {
          const summary = await gamificationService.getSummary();
          setGSummary(summary);
        } catch {}
      } catch (e) {
        console.error("Failed to load profile", e);
        Alert.alert(
          t("profile.profile_load_error"),
          t("profile.profile_load_error")
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const computeErrors = (state) => {
    const vals = pickEditable(state);
    const { error } = profileSchema.validate(vals, {
      abortEarly: false,
      allowUnknown: true,
    });
    const map = {};
    if (error)
      for (const d of error.details) {
        const k = d.path?.[0];
        if (k && !map[k]) map[k] = d.message;
      }
    return map;
  };

  const onSave = async () => {
    const map = computeErrors(form);
    setErrors(map);
    if (Object.keys(map).length > 0) return;

    setSaving(true);
    try {
      // בנה PATCH מינימלי (רק מה שהשתנה)
      const patch = {};
      if (!original || form.name !== (original.name || ""))
        patch.name = form.name;
      if (!original || form.email !== (original.email || ""))
        patch.email = form.email;
      if (!original || form.phone !== (original.phone || ""))
        patch.phone = form.phone;
      if (!original || form.bio !== (original.bio || "")) patch.bio = form.bio;

      // אם המשתמש בחר תמונה חדשה, נעלה אותה ל-S3
      if (selectedImage) {
        try {
          const uploadResult = await uploadService.uploadProfilePicture(
            selectedImage
          );
          if (uploadResult && uploadResult.success) {
            patch.profilePicture = uploadResult.fileUrl;
            // עדכן את ה-form עם ה-URL החדש
            setForm((prev) => ({
              ...prev,
              profilePicture: uploadResult.fileUrl,
            }));
          }
        } catch (error) {
          Alert.alert(
            t("profile.image_upload_error"),
            t("profile.image_upload_error")
          );
          return;
        }
      } else if (
        !original ||
        form.profilePicture !== (original.profilePicture || "")
      ) {
        patch.profilePicture = form.profilePicture;
      }

      // בדוק אם יש שינויים בכתובת
      if (
        !original ||
        form.address.street !== (original.address?.street || "") ||
        form.address.city !== (original.address?.city || "") ||
        form.address.country !== (original.address?.country || "") ||
        form.address.houseNumber !==
          String(original.address?.houseNumber ?? "") ||
        form.address.zipCode !== String(original.address?.zipCode ?? "")
      ) {
        patch.address = form.address;
      }

      // בדוק אם יש שינויים בתאריך לידה
      if (!original || form.dateOfBirth !== dateToISO(original.dateOfBirth)) {
        patch.dateOfBirth = form.dateOfBirth;
      }

      // אם יש שינויים, שמור אותם
      if (Object.keys(patch).length > 0) {
        await userService.updateProfile(patch);

        // עדכן את הנתונים המקוריים
        await reloadProfile();

        // נקה את התמונה הנבחרת
        setSelectedImage(null);

        // חזור למצב צפייה
        setEditMode(false);
        setErrors({});

        Alert.alert(
          t("profile.profile_update_success"),
          t("profile.profile_update_success")
        );
      }
    } catch (e) {
      console.error("Failed to save profile", e);
      Alert.alert(
        t("profile.profile_update_error"),
        e?.response?.data?.message || t("profile.profile_update_error")
      );
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    if (!original) return;
    setForm({
      name: original.name || "",
      email: original.email || "",
      phone: original.phone || "",
      bio: original.bio || "",
      profilePicture: original.profilePicture || "",
      dateOfBirth: dateToISO(original.dateOfBirth),
      address: {
        street: original.address?.street || "",
        city: original.address?.city || "",
        country: original.address?.country || "",
        houseNumber:
          original.address?.houseNumber != null
            ? String(original.address.houseNumber)
            : "",
        zipCode:
          original.address?.zipCode != null
            ? String(original.address.zipCode)
            : "",
      },
      subscriptionPlan: original.subscriptionPlan || "free",
      subscriptionExpiresAt: original.subscriptionExpiresAt || null,
      isAdmin: !!original.isAdmin,
      googleId: original.googleId || null,
      facebookId: original.facebookId || null,
      lastActive: original.lastActive || null,
      createdAt: original.createdAt || null,
      updatedAt: original.updatedAt || null,
    });
    setErrors({});
    setEditMode(false);
    setSelectedImage(null); // נקה גם את התמונה הנבחרת
  };

  const onChangePwd = async () => {
    const { error } = passwordSchema.validate(pwd, { abortEarly: false });
    const map = {};
    if (error)
      for (const d of error.details) {
        const k = d.path?.[0];
        if (k && !map[k]) map[k] = d.message;
      }
    setPwdErrors(map);
    if (Object.keys(map).length > 0) return;

    setPwdSaving(true);
    try {
      await userService.changePassword({
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword,
      });
      setPwd({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwdErrors({});
      setShowPwd(false);
      Alert.alert(
        t("profile.password_change_success"),
        t("profile.password_change_success")
      );
    } catch (e) {
      console.error("Failed to change password", e);
      Alert.alert(
        t("profile.password_change_error"),
        e?.response?.data?.message || t("profile.password_change_error")
      );
    } finally {
      setPwdSaving(false);
    }
  };

  const FieldRow = ({ label, value }) => (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{fmt(value)}</Text>
    </View>
  );

  const PlanBadge = () => (
    <View style={styles.rowWrap}>
      <Chip
        icon="star"
        selectedColor={COLORS.white}
        style={[styles.planChip, styles[form.subscriptionPlan] || styles.free]}
      >
        {String(form.subscriptionPlan || t("details.free")).toUpperCase()}
      </Chip>
      {form.subscriptionExpiresAt ? (
        <Text style={styles.metaText}>
          {t("profile.subscription_expires_on")}{" "}
          {new Date(form.subscriptionExpiresAt).toLocaleDateString()}
        </Text>
      ) : null}
      {form.isAdmin ? (
        <Chip style={styles.adminChip} icon="shield-account">
          {t("profile.admin")}
        </Chip>
      ) : null}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            {
              paddingBottom: (insets?.bottom || 16) + SIZING.padding * 2,
              minHeight: "100%",
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Profile Picture */}
          <View style={styles.headerCard}>
            {/* Hero background */}
            <ImageBackground
              source={require("../../assets/images/cover.png")}
              style={styles.hero}
              resizeMode="cover"
            >
              <View style={styles.heroShade} />
            </ImageBackground>
            <View style={styles.profilePictureSection}>
              <TouchableOpacity onPress={() => setShowImageOptions(true)}>
                <View style={styles.avatarRingOuter}>
                  <View style={styles.avatarRingInner}>
                    <Avatar.Image
                      size={120}
                      source={getProfileImageSource()}
                      style={styles.profileAvatar}
                      defaultSource={require("../../assets/images/avatars/default-avatar-profile.png")}
                      onError={(error) => {
                        console.error("Error loading profile image:", error);
                        setForm((prev) => ({ ...prev, profilePicture: "" }));
                      }}
                    />
                  </View>
                </View>
                <View style={styles.avatarOverlay}>
                  <IconButton
                    icon="camera"
                    size={22}
                    iconColor={COLORS.white}
                    style={styles.cameraIcon}
                  />
                </View>
              </TouchableOpacity>

              <Text style={styles.profilePictureLabel}>
                {t("profile.profile_picture")}
              </Text>

              {/* הצג מידע על התמונה הנוכחית רק במצב עריכה */}
              {editMode && (
                <>
                  {selectedImage ? (
                    <View style={styles.currentImageContainer}>
                      <Text numberOfLines={1} style={{ flex: 1 }}>
                        {selectedImage.name || t("profile.image_options")}
                      </Text>
                      <Button
                        mode="outlined"
                        onPress={() => setSelectedImage(null)}
                        compact
                      >
                        {t("profile.image_remove")}
                      </Button>
                    </View>
                  ) : form.profilePicture ? (
                    <View style={styles.currentImageContainer}>
                      <Text numberOfLines={1} style={{ flex: 1 }}>
                        {t("profile.image_options")}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.noImageText}>
                      {t("profile.image_options")}
                    </Text>
                  )}
                </>
              )}
            </View>
            <View style={styles.avatarActions}>
              {!editMode ? (
                <Button
                  mode="contained"
                  onPress={() => setEditMode(true)}
                  style={styles.ctaBtn}
                >
                  {t("action.edit_profile")}
                </Button>
              ) : (
                <>
                  <Button mode="outlined" onPress={cancelEdit}>
                    {t("action.cancel")}
                  </Button>
                  <Button
                    mode="contained"
                    style={styles.ctaBtn}
                    onPress={() => {
                      onSave();
                    }}
                    loading={saving}
                    disabled={saving || !isDirty}
                  >
                    {saving ? t("action.saving") : t("action.save_changes")}
                  </Button>
                </>
              )}
            </View>
          </View>

          {/* Image Options Modal */}
          <Portal>
            <Dialog
              visible={showImageOptions}
              onDismiss={() => setShowImageOptions(false)}
              style={styles.imageOptionsDialog}
            >
              <Dialog.Title>{t("profile.image_options")}</Dialog.Title>
              <Dialog.Content>
                <View style={styles.imageOptionsContainer}>
                  <Button
                    mode="contained"
                    onPress={handlePickImage}
                    icon="camera"
                    style={styles.imageOptionButton}
                  >
                    {form.profilePicture
                      ? t("profile.image_options")
                      : t("profile.image_choose_from_gallery")}
                  </Button>

                  {form.profilePicture && (
                    <Button
                      mode="outlined"
                      onPress={handleRemoveProfilePicture}
                      icon="delete"
                      style={[styles.imageOptionButton, styles.deleteButton]}
                      textColor={COLORS.error}
                    >
                      {t("profile.image_remove")}
                    </Button>
                  )}

                  <Button
                    mode="outlined"
                    onPress={() => setShowImageOptions(false)}
                    style={styles.imageOptionButton}
                  >
                    {t("profile.image_cancel")}
                  </Button>
                </View>
              </Dialog.Content>
            </Dialog>
          </Portal>

          {/* Gamification: Points & Streak */}
          <List.Section>
            <List.Subheader style={styles.sectionHeader}>
              {t("profile.my_points") || "הניקוד שלי"}
            </List.Subheader>
            <View
              style={[
                styles.card,
                gSummary?.levelInfo &&
                  styles[`rankCard_${gSummary.levelInfo.rank}`],
              ]}
            >
              {/* Level and Rank Display */}
              {gSummary?.levelInfo && (
                <View
                  style={[
                    styles.levelDisplay,
                    { backgroundColor: gSummary.levelInfo.rankColor + "20" },
                  ]}
                >
                  <View style={styles.levelInfo}>
                    <Text
                      style={[
                        styles.rankText,
                        { color: gSummary.levelInfo.rankColor },
                      ]}
                    >
                      {gSummary.levelInfo.rankIcon}{" "}
                      {t(`gamification.ranks.${gSummary.levelInfo.rank}`)}
                    </Text>
                    <Text
                      style={[
                        styles.levelText,
                        { color: gSummary.levelInfo.rankColor },
                      ]}
                    >
                      {t("gamification.level")} {gSummary.levelInfo.level}
                    </Text>
                  </View>
                  {gSummary.levelInfo.pointsToNextLevel > 0 && (
                    <View style={styles.progressContainer}>
                      <Text style={styles.progressText}>
                        {gSummary.levelInfo.pointsToNextLevel}{" "}
                        {t("gamification.points_to_next")}
                      </Text>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${Math.min(
                                100,
                                (gSummary.levelInfo.pointsInCurrentLevel /
                                  gSummary.levelInfo
                                    .totalPointsForCurrentLevel) *
                                  100
                              )}%`,
                              backgroundColor: gSummary.levelInfo.rankColor,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.rowWrap}>
                <Chip icon="star-circle">{`${t("gamification.points")}: ${
                  gSummary?.points ?? 0
                }`}</Chip>
                <Chip icon="trophy">{`${t("profile.coins") || "מטבעות"}: ${
                  gSummary?.coins ?? 0
                }`}</Chip>
                <Chip icon="fire">{`${
                  t("profile.daily_streak") || "רצף יומי"
                }: ${gSummary?.dailyStreak ?? 0}`}</Chip>
              </View>
              {(gSummary?.dailyCompletionBonusToday ||
                gSummary?.weeklyPerfectBonusToday) && (
                <View style={{ marginTop: 8 }}>
                  {gSummary?.dailyCompletionBonusToday ? (
                    <Text style={styles.metaText}>
                      {t("gamification.toast_daily_completion_bonus")}
                    </Text>
                  ) : null}
                  {gSummary?.weeklyPerfectBonusToday ? (
                    <Text style={styles.metaText}>
                      {t("gamification.toast_weekly_perfect_bonus")}
                    </Text>
                  ) : null}
                </View>
              )}
              {last7 && last7.length > 0 ? (
                <View style={{ marginTop: 12 }}>
                  <Text
                    style={[
                      styles.metaText,
                      {
                        marginBottom: 8,
                        fontSize: 14,
                        fontWeight: "600",
                        color: COLORS.primary,
                        textAlign: "center",
                      },
                    ]}
                  >
                    📅 7 הימים האחרונים
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 4 }}
                    style={{ marginHorizontal: -4 }}
                  >
                    {last7.map((d, index) => (
                      <View
                        key={d.dateKey}
                        style={[
                          styles.dayCard,
                          d.isToday && styles.todayCard,
                          {
                            marginLeft: index === 0 ? 0 : 12,
                            backgroundColor: d.isToday
                              ? COLORS.primary
                              : COLORS.white,
                            borderColor: d.isToday
                              ? COLORS.primary
                              : d.allDone
                              ? COLORS.success
                              : COLORS.neutral + "30",
                            borderWidth: d.isToday ? 2.5 : 1.5,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayDate,
                            d.isToday && styles.todayText,
                            {
                              color: d.isToday
                                ? COLORS.white
                                : d.allDone
                                ? COLORS.success
                                : COLORS.neutral,
                            },
                          ]}
                        >
                          {d.isToday ? "היום" : d.dateKey.slice(5)}
                        </Text>
                        <View style={styles.dayProgress}>
                          <Text
                            style={[
                              styles.dayProgressText,
                              d.isToday && styles.todayText,
                              {
                                color: d.isToday
                                  ? COLORS.white
                                  : d.allDone
                                  ? COLORS.success
                                  : COLORS.neutral,
                              },
                            ]}
                          >
                            {d.completed}/{d.total}
                          </Text>
                          {d.allDone && (
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: "bold",
                                color: d.isToday
                                  ? COLORS.white
                                  : COLORS.success,
                                marginLeft: 4,
                              }}
                            >
                              ✓
                            </Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ) : null}
            </View>
          </List.Section>

          {/* My Pets */}
          <List.Section>
            <List.Subheader style={styles.sectionHeader}>
              {t("profile.my_pets") || "החיות שלי"}
            </List.Subheader>
            <View style={styles.card}>
              {Array.isArray(pets) && pets.length > 0 ? (
                pets.map((p) => (
                  <TouchableOpacity
                    key={p._id || p.id}
                    style={{
                      marginBottom: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                    onPress={() => router.push(`/pets/${p._id || p.id}`)}
                  >
                    <Text style={styles.metaText}>{p.name}</Text>
                    <Text style={{ fontSize: 20, color: COLORS.disabled }}>
                      ▶
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.metaText}>
                  {t("profile.no_pets") || "אין חיות להצגה"}
                </Text>
              )}
            </View>
          </List.Section>

          {/* Basic Info */}
          <List.Section>
            <List.Subheader style={styles.sectionHeader}>
              {t("profile.basic_info")}
            </List.Subheader>

            {!editMode ? (
              <View style={styles.card}>
                <FieldRow label={t("profile.name")} value={form.name} />
                <Divider style={styles.divider} />
                <FieldRow label={t("profile.email")} value={form.email} />
                <Divider style={styles.divider} />
                <FieldRow label={t("profile.phone")} value={form.phone} />
                <Divider style={styles.divider} />
                <FieldRow
                  label={t("profile.date_of_birth")}
                  value={form.dateOfBirth}
                />
                <Divider style={styles.divider} />
                <FieldRow label={t("profile.bio")} value={form.bio} />
              </View>
            ) : (
              <View style={styles.card}>
                <TextInput
                  label={t("profile.name")}
                  value={form.name}
                  onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.name}
                />
                <HelperText type="error" visible={!!errors.name}>
                  {errors.name}
                </HelperText>

                <TextInput
                  label={t("profile.email")}
                  value={form.email}
                  onChangeText={(v) =>
                    setForm((f) => ({ ...f, email: v.trim() }))
                  }
                  mode="outlined"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={!!errors.email}
                />
                <HelperText type="error" visible={!!errors.email}>
                  {errors.email}
                </HelperText>

                <TextInput
                  label={t("profile.phone")}
                  value={form.phone}
                  onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="phone-pad"
                  error={!!errors.phone}
                />
                <HelperText type="error" visible={!!errors.phone}>
                  {errors.phone}
                </HelperText>

                <TextInput
                  label={t("profile.date_of_birth")}
                  value={form.dateOfBirth}
                  onChangeText={(v) =>
                    setForm((f) => ({ ...f, dateOfBirth: v }))
                  }
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.dateOfBirth}
                />
                <HelperText type="error" visible={!!errors.dateOfBirth}>
                  {errors.dateOfBirth}
                </HelperText>

                <TextInput
                  label={t("profile.bio")}
                  value={form.bio}
                  onChangeText={(v) => setForm((f) => ({ ...f, bio: v }))}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  style={[styles.input, { textAlignVertical: "top" }]}
                  error={!!errors.bio}
                />
                <HelperText type="error" visible={!!errors.bio}>
                  {errors.bio}
                </HelperText>
              </View>
            )}
          </List.Section>

          {/* Address */}
          <List.Section>
            <List.Subheader style={styles.sectionHeader}>
              {t("profile.address")}
            </List.Subheader>

            {!editMode ? (
              <View style={styles.card}>
                <FieldRow
                  label={t("profile.address.street")}
                  value={form.address.street}
                />
                <Divider style={styles.divider} />
                <FieldRow
                  label={t("profile.address.house_number")}
                  value={form.address.houseNumber}
                />
                <Divider style={styles.divider} />
                <FieldRow
                  label={t("profile.address.city")}
                  value={form.address.city}
                />
                <Divider style={styles.divider} />
                <FieldRow
                  label={t("profile.address.country")}
                  value={form.address.country}
                />
                <Divider style={styles.divider} />
                <FieldRow
                  label={t("profile.address.zip_code")}
                  value={form.address.zipCode}
                />
              </View>
            ) : (
              <View style={styles.card}>
                <TextInput
                  label={t("profile.address.street")}
                  value={form.address.street}
                  onChangeText={(v) =>
                    setForm((f) => ({
                      ...f,
                      address: { ...f.address, street: v },
                    }))
                  }
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label={t("profile.address.house_number")}
                  value={String(form.address.houseNumber || "")}
                  onChangeText={(v) =>
                    setForm((f) => ({
                      ...f,
                      address: {
                        ...f.address,
                        houseNumber: v.replace(/[^0-9]/g, ""),
                      },
                    }))
                  }
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label={t("profile.address.city")}
                  value={form.address.city}
                  onChangeText={(v) =>
                    setForm((f) => ({
                      ...f,
                      address: { ...f.address, city: v },
                    }))
                  }
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label={t("profile.address.country")}
                  value={form.address.country}
                  onChangeText={(v) =>
                    setForm((f) => ({
                      ...f,
                      address: { ...f.address, country: v },
                    }))
                  }
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label={t("profile.address.zip_code")}
                  value={String(form.address.zipCode || "")}
                  onChangeText={(v) =>
                    setForm((f) => ({
                      ...f,
                      address: {
                        ...f.address,
                        zipCode: v.replace(/[^0-9]/g, ""),
                      },
                    }))
                  }
                  mode="outlined"
                  style={styles.input}
                />
              </View>
            )}
          </List.Section>

          {/* Subscription & Social */}
          <List.Section>
            <List.Subheader style={styles.sectionHeader}>
              {t("profile.subscription_and_social")}
            </List.Subheader>
            <View style={styles.card}>
              <View style={styles.rowWrap}>
                <Text style={styles.metaText}>
                  {t("profile.subscription_plan")}
                </Text>
                <PlanBadge />
              </View>
              {form.subscriptionExpiresAt ? (
                <Text style={styles.metaText}>
                  {t("profile.subscription_expires_on")}
                  {new Date(form.subscriptionExpiresAt).toLocaleDateString()}
                </Text>
              ) : (
                <Text style={styles.metaText}>
                  {t("profile.no_expiration_date")}
                </Text>
              )}

              <Divider style={{ marginVertical: SIZING.base }} />

              <View style={styles.rowWrap}>
                <Chip
                  icon={form.googleId ? "check-circle" : "google"}
                  mode="outlined"
                >
                  {form.googleId ? "Google connected" : "Connect Google"}
                </Chip>
                <Chip
                  icon={form.facebookId ? "check-circle" : "facebook"}
                  mode="outlined"
                >
                  {form.facebookId ? "Facebook connected" : "Connect Facebook"}
                </Chip>
              </View>
              <HelperText type="info" visible>
                {t("profile.social_linking_info")}
              </HelperText>
            </View>
          </List.Section>

          {/* Security */}
          <List.Section>
            <List.Subheader style={styles.sectionHeader}>
              {t("profile.security")}
            </List.Subheader>
            <View style={styles.card}>
              {!showPwd ? (
                <Button mode="contained" onPress={() => setShowPwd(true)}>
                  {t("profile.change_password")}
                </Button>
              ) : (
                <>
                  <TextInput
                    label={t("profile.current_password")}
                    value={pwd.currentPassword}
                    onChangeText={(v) =>
                      setPwd((p) => ({ ...p, currentPassword: v }))
                    }
                    mode="outlined"
                    style={styles.input}
                    secureTextEntry
                    error={!!pwdErrors.currentPassword}
                  />
                  <HelperText
                    type="error"
                    visible={!!pwdErrors.currentPassword}
                  >
                    {pwdErrors.currentPassword}
                  </HelperText>

                  <TextInput
                    label={t("profile.new_password")}
                    value={pwd.newPassword}
                    onChangeText={(v) =>
                      setPwd((p) => ({ ...p, newPassword: v }))
                    }
                    mode="outlined"
                    style={styles.input}
                    secureTextEntry
                    error={!!pwdErrors.newPassword}
                  />
                  <HelperText type="error" visible={!!pwdErrors.newPassword}>
                    {pwdErrors.newPassword}
                  </HelperText>

                  <TextInput
                    label={t("profile.confirm_password")}
                    value={pwd.confirmPassword}
                    onChangeText={(v) =>
                      setPwd((p) => ({ ...p, confirmPassword: v }))
                    }
                    mode="outlined"
                    style={styles.input}
                    secureTextEntry
                    error={!!pwdErrors.confirmPassword}
                  />
                  <HelperText
                    type="error"
                    visible={!!pwdErrors.confirmPassword}
                  >
                    {pwdErrors.confirmPassword}
                  </HelperText>

                  <View style={styles.rowBetween}>
                    <Button
                      mode="outlined"
                      onPress={() => {
                        setPwd({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                        setPwdErrors({});
                        setShowPwd(false);
                      }}
                    >
                      {t("action.cancel")}
                    </Button>
                    <Button
                      mode="contained"
                      onPress={onChangePwd}
                      loading={pwdSaving}
                      disabled={pwdSaving}
                    >
                      {pwdSaving
                        ? t("action.saving")
                        : t("action.save_changes")}
                    </Button>
                  </View>
                </>
              )}
            </View>
          </List.Section>

          {/* Meta */}
          <List.Section>
            <List.Subheader style={styles.sectionHeader}>
              {t("profile.meta_info")}
            </List.Subheader>
            <View style={styles.card}>
              <Text style={styles.metaText}>
                {t("profile.last_active")}{" "}
                {form.lastActive
                  ? new Date(form.lastActive).toLocaleString()
                  : t("profile.never_active")}
              </Text>
              <Text style={styles.metaText}>
                {t("profile.created_at")}:{" "}
                {form.createdAt
                  ? new Date(form.createdAt).toLocaleDateString()
                  : t("profile.never_active")}
              </Text>
              {form.updatedAt ? (
                <Text style={styles.metaText}>
                  {t("profile.updated_at")}:{" "}
                  {new Date(form.updatedAt).toLocaleDateString()}
                </Text>
              ) : (
                <Text style={styles.metaText}>
                  {t("profile.never_updated")}
                </Text>
              )}
            </View>
          </List.Section>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const BRAND = {
  primary: "#007C82", // טורקיז
  accent: "#F2A900", // צהוב-כתום
  dark: "#0F3B3C", // טורקיז כהה מאוד
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  kav: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: SIZING.padding,
    backgroundColor: "#F5F7F8",
    marginTop: SIZING.padding,
  },

  /* --- HERO --- */
  hero: {
    height: 150,
    marginHorizontal: -SIZING.padding,
    marginBottom: -SIZING.margin * 2,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
    zIndex: 0,
  },
  heroShade: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.08)",
  },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  /* כרטיס עליון “צף” */
  headerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingHorizontal: SIZING.padding,
    paddingBottom: SIZING.padding,
    marginBottom: SIZING.margin,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },

  avatarActions: {
    marginTop: SIZING.base,
    flexDirection: "row",
    gap: SIZING.base,
  },

  /* כותרות סקשנים */
  sectionHeader: {
    ...FONTS.h3,
    color: BRAND.dark,
    marginBottom: 6,
  },

  /* קלפים */
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SIZING.padding,
    marginBottom: SIZING.margin,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.06)",
  },

  input: { marginBottom: SIZING.base },

  rowWrap: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: SIZING.base,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SIZING.base,
  },

  metaText: { ...FONTS.caption, color: "#5B6670" },

  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  fieldLabel: { ...FONTS.caption, color: "#5B6670" },
  fieldValue: { ...FONTS.body, color: COLORS.black, maxWidth: "60%" },

  /* צ'יפים */
  planChip: {
    backgroundColor: BRAND.dark,
    marginRight: SIZING.base,
  },
  adminChip: { marginLeft: SIZING.base, backgroundColor: "#EAF4F5" },
  free: { backgroundColor: "#D9E2E7" },
  premium: { backgroundColor: BRAND.primary },
  gold: { backgroundColor: BRAND.accent },

  divider: { marginVertical: 4, opacity: 0.6 },

  /* --- אווטאר וטבעת דו-גוונית --- */
  profilePictureSection: {
    alignItems: "center",
    marginBottom: SIZING.base,
  },
  profilePictureLabel: {
    marginTop: SIZING.base,
    fontSize: FONTS.body.fontSize,
    color: "#5B6670",
  },
  profileAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e9eef0",
  },
  avatarRingOuter: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: BRAND.accent,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  avatarRingInner: {
    width: "100%",
    height: "100%",
    borderRadius: 64,
    backgroundColor: BRAND.primary,
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarOverlay: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: BRAND.primary,
    borderRadius: 16,
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraIcon: {
    backgroundColor: "transparent",
  },

  /* כפתור עיקרי */
  ctaBtn: {
    backgroundColor: BRAND.primary,
    borderRadius: 16,
    paddingHorizontal: 8,
  },

  currentImageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SIZING.base,
    paddingVertical: SIZING.base,
    paddingHorizontal: SIZING.base,
    backgroundColor: "rgba(0,124,130,0.07)",
    borderRadius: 12,
  },

  imageOptionsDialog: { margin: SIZING.base },
  imageOptionsContainer: { padding: SIZING.base },
  imageOptionButton: { marginBottom: SIZING.base },
  deleteButton: {
    backgroundColor: "rgba(220,53,69,0.06)",
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  noImageText: {
    fontSize: FONTS.body.fontSize,
    color: "#5B6670",
    marginTop: SIZING.base,
    fontStyle: "italic",
  },

  // Day cards for carousel
  dayCard: {
    width: 90,
    height: 70,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  todayCard: {
    elevation: 6,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    transform: [{ scale: 1.08 }],
    borderWidth: 2.5,
  },
  dayDate: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  dayProgress: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dayProgressText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  todayText: {
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Level system styles
  levelDisplay: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  levelInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  rankText: {
    fontSize: 16,
    fontWeight: "700",
  },
  levelText: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressContainer: {
    marginTop: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },

  // Rank-specific card styles
  rankCard_wood: {
    borderColor: "#8B4513",
    borderWidth: 2,
    shadowColor: "#8B4513",
  },
  rankCard_bronze: {
    borderColor: "#CD7F32",
    borderWidth: 2,
    shadowColor: "#CD7F32",
  },
  rankCard_silver: {
    borderColor: "#C0C0C0",
    borderWidth: 2,
    shadowColor: "#C0C0C0",
  },
  rankCard_gold: {
    borderColor: "#FFD700",
    borderWidth: 2,
    shadowColor: "#FFD700",
    elevation: 4,
    shadowOpacity: 0.3,
  },
  rankCard_diamond: {
    borderColor: "#B9F2FF",
    borderWidth: 2,
    shadowColor: "#B9F2FF",
    elevation: 6,
    shadowOpacity: 0.4,
  },
  rankCard_legendary: {
    borderColor: "#FF6B6B",
    borderWidth: 3,
    shadowColor: "#FF6B6B",
    elevation: 8,
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
});
