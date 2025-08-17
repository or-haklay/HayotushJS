import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
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
} from "react-native-paper";
import Joi from "joi";
import { COLORS, FONTS, SIZING } from "../../theme/theme";
import userService from "../../services/userService";
import { useTranslation } from "react-i18next";

const dateToISO = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");
const safeNum = (v) =>
  v === "" || v === null || v === undefined ? undefined : Number(v);
const fmt = (v) =>
  v === undefined || v === null || v === "" ? "—" : String(v);

const profileSchema = Joi.object({
  name: Joi.string().min(2).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Invalid email address",
    }),
  phone: Joi.string()
    .allow("", null)
    .pattern(/^[0-9+\-()\s]*$/)
    .messages({
      "string.pattern.base": "Phone may contain digits and + - ( )",
    }),
  bio: Joi.string()
    .allow("", null)
    .max(280)
    .messages({ "string.max": "Bio must be at most 280 characters" }),
  profilePicture: Joi.string()
    .uri({ allowRelative: false })
    .allow("", null)
    .messages({ "string.uri": "Profile picture must be a valid URL" }),
  dateOfBirth: Joi.string()
    .allow("", null)
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({ "string.pattern.base": "Date of birth must be YYYY-MM-DD" }),
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
});

const passwordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({ "string.empty": "Current password is required" }),
  newPassword: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .required()
    .messages({
      "string.pattern.base":
        "New password must be 8+ chars incl. uppercase, lowercase and a digit",
    })
    .messages({
      "string.pattern.base":
        "New password must be 8+ chars incl. uppercase, lowercase and a digit",
      "string.empty": "New password is required",
    }),
  confirmPassword: Joi.any().valid(Joi.ref("newPassword")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Confirm your new password",
  }),
});

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
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
      } catch (e) {
        console.error("Failed to load profile", e);
        Alert.alert("Error", "Could not load your profile.");
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

    // בנה PATCH מינימלי (רק מה שהשתנה)
    const patch = {};
    if (!original || form.name !== (original.name || ""))
      patch.name = form.name;
    if (!original || form.email !== (original.email || ""))
      patch.email = form.email;
    if (!original || form.phone !== (original.phone || ""))
      patch.phone = form.phone;
    if (!original || form.bio !== (original.bio || "")) patch.bio = form.bio;
    if (!original || form.profilePicture !== (original.profilePicture || ""))
      patch.profilePicture = form.profilePicture;
    if (!original || form.dateOfBirth !== dateToISO(original.dateOfBirth))
      patch.dateOfBirth = form.dateOfBirth || null;

    const addr = {
      street: form.address.street || undefined,
      city: form.address.city || undefined,
      country: form.address.country || undefined,
      houseNumber:
        form.address.houseNumber === ""
          ? undefined
          : Number(form.address.houseNumber),
      zipCode:
        form.address.zipCode === "" ? undefined : Number(form.address.zipCode),
    };
    const addrOrig = {
      street: original?.address?.street,
      city: original?.address?.city,
      country: original?.address?.country,
      houseNumber: original?.address?.houseNumber,
      zipCode: original?.address?.zipCode,
    };
    if (!original || JSON.stringify(addr) !== JSON.stringify(addrOrig)) {
      patch.address = addr;
    }

    if (Object.keys(patch).length === 0) {
      Alert.alert("Nothing to save", "No changes detected.");
      return;
    }

    // דיבאגר:
    console.log("[Profile] Saving patch =>", patch);

    setSaving(true);
    try {
      const updated = await userService.updateMe(patch);
      setOriginal(updated);
      setEditMode(false);
      Alert.alert("Saved", "Your profile has been updated.");
    } catch (e) {
      console.error(
        "[Profile] updateMe failed:",
        e?.response?.status,
        e?.response?.data || e.message
      );
      Alert.alert(
        "Error",
        e?.response?.data?.message || "Could not save your profile."
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
      Alert.alert("Password updated", "Your password has been changed.");
    } catch (e) {
      console.error("Failed to change password", e);
      Alert.alert(
        "Error",
        e?.response?.data?.message || "Could not change password."
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
          Expires: {new Date(form.subscriptionExpiresAt).toLocaleDateString()}
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
          {/* Header */}
          <View style={styles.headerCard}>
            <View style={styles.avatarRow}>
              {form.profilePicture ? (
                <Avatar.Image size={92} source={{ uri: form.profilePicture }} />
              ) : (
                <Avatar.Icon size={92} icon="account" />
              )}
              <View style={{ flex: 1, marginLeft: SIZING.base }}>
                <Text style={styles.title}>{fmt(form.name)}</Text>
                <Text style={styles.subtitle}>{fmt(form.email)}</Text>
                <PlanBadge />
              </View>
            </View>
            <View style={styles.avatarActions}>
              {!editMode ? (
                <Button mode="contained" onPress={() => setEditMode(true)}>
                  {t("action.edit_profile")}
                </Button>
              ) : (
                <>
                  <Button mode="outlined" onPress={cancelEdit}>
                    {t("action.cancel")}
                  </Button>
                  <Button
                    mode="contained"
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
                  label={t("profile.profile_picture")}
                  value={form.profilePicture}
                  onChangeText={(v) =>
                    setForm((f) => ({ ...f, profilePicture: v.trim() }))
                  }
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.profilePicture}
                />
                <HelperText type="error" visible={!!errors.profilePicture}>
                  {errors.profilePicture}
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
                <Text style={styles.metaText}>Plan</Text>
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
                  : "Unknown"}
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  kav: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: SIZING.padding,
    backgroundColor: COLORS.background,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  headerCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZING.radius_lg,
    padding: SIZING.padding,
    marginBottom: SIZING.margin,
    elevation: 2,
  },
  avatarRow: { flexDirection: "row", alignItems: "center" },
  avatarActions: {
    marginTop: SIZING.base,
    flexDirection: "row",
    gap: SIZING.base,
  },
  title: { ...FONTS.h2, color: COLORS.neutral },
  subtitle: { ...FONTS.body, color: COLORS.neutral },

  sectionHeader: { ...FONTS.h3, color: COLORS.neutral },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZING.radius_lg,
    padding: SIZING.padding,
    marginBottom: SIZING.margin,
    elevation: 1,
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
  metaText: { ...FONTS.caption, color: COLORS.neutral },

  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  fieldLabel: { ...FONTS.caption, color: COLORS.neutral },
  fieldValue: { ...FONTS.body, color: COLORS.black, maxWidth: "60%" },

  planChip: { backgroundColor: COLORS.dark, marginRight: SIZING.base },
  adminChip: { marginLeft: SIZING.base },
  free: { backgroundColor: COLORS.neutral },
  premium: { backgroundColor: "#017A82" },
  gold: { backgroundColor: "#FFC107" },
  divider: { marginVertical: 4 },
});
