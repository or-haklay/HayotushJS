import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Text,
  TextInput,
  Button,
  Snackbar,
  Menu,
  Provider,
  Card,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { COLORS, FONTS } from "../../theme/theme";
import petService from "../../services/petService";
import { useTranslation } from "react-i18next";
import { useToast } from "../../context/ToastContext";

export default function PetForm() {
  const { petId } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState("");
  const [species, setSpecies] = useState("dog");
  const [breed, setBreed] = useState("");
  const [chipNumber, setChipNumber] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [birthDate, setBirthDate] = useState(null);
  const [sex, setSex] = useState("unknown");
  const [color, setColor] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [sexMenuVisible, setSexMenuVisible] = useState(false);
  const [speciesMenuVisible, setSpeciesMenuVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    (async () => {
      if (!petId) return;
      try {
        const p = await petService.getPetById(petId);
        setName(p.name || "");
        setSpecies(p.species || "dog");
        setBreed(p.breed || "");
        setChipNumber(p.chipNumber || "");
        setWeightKg(p.weightKg ? p.weightKg.toString() : "");
        setBirthDate(p.birthDate ? new Date(p.birthDate) : null);
        setSex(p.sex || "unknown");
        setColor(p.color || "");
        setNotes(p.notes || "");
      } catch (error) {
        console.error("Error loading pet:", error);
        setErr(t("pets.edit_load_error"));
      }
    })();
  }, [petId, t]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const submit = async () => {
    if (!name.trim()) return setErr(t("pets.name_required"));
    if (!species.trim()) return setErr(t("pets.species_required"));

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        species: species.trim(),
        breed: breed?.trim() || undefined,
        chipNumber: chipNumber?.trim() || undefined,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        birthDate: birthDate ? birthDate.toISOString() : undefined,
        sex: sex || undefined,
        color: color?.trim() || undefined,
        notes: notes?.trim() || undefined,
      };

      if (petId) {
        await petService.updatePet(petId, payload);
        showSuccess(t("toast.success.pet_updated"));
      } else {
        await petService.createPet(payload);
        showSuccess(t("toast.success.pet_created"));
      }

      router.back();
    } catch (error) {
      showError(t("toast.error.save_failed"));
      setErr(t("pets.save_error"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white, padding: 16 }}>
      <Text style={FONTS.h2}>
        {petId ? t("pets.edit_pet") : t("pets.add_pet")}
      </Text>

      <TextInput
        label={t("pets.name")}
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={{ marginTop: 12 }}
      />

      <View style={{ marginTop: 12 }}>
        <Text style={{ marginBottom: 8, fontSize: 16, color: COLORS.dark }}>
          {t("pets.species")}
        </Text>
        <Menu
          visible={speciesMenuVisible}
          onDismiss={() => setSpeciesMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setSpeciesMenuVisible(true)}
              style={{ justifyContent: "flex-start" }}
            >
              {t(`pets.species.${species}`)}
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setSpecies("dog");
              setSpeciesMenuVisible(false);
            }}
            title={t("pets.species.dog")}
          />
          <Menu.Item
            onPress={() => {
              setSpecies("cat");
              setSpeciesMenuVisible(false);
            }}
            title={t("pets.species.cat")}
          />
          <Menu.Item
            onPress={() => {
              setSpecies("bird");
              setSpeciesMenuVisible(false);
            }}
            title={t("pets.species.bird")}
          />
          <Menu.Item
            onPress={() => {
              setSpecies("fish");
              setSpeciesMenuVisible(false);
            }}
            title={t("pets.species.fish")}
          />
          <Menu.Item
            onPress={() => {
              setSpecies("other");
              setSpeciesMenuVisible(false);
            }}
            title={t("pets.species.other")}
          />
        </Menu>
      </View>

      <TextInput
        label={t("pets.breed_optional")}
        value={breed}
        onChangeText={setBreed}
        mode="outlined"
        style={{ marginTop: 12 }}
      />

      <TextInput
        label={t("pets.weight_optional")}
        value={weightKg}
        onChangeText={setWeightKg}
        keyboardType="numeric"
        mode="outlined"
        style={{ marginTop: 12 }}
      />

      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={{
          borderWidth: 1,
          borderColor: "#E0E0E0",
          borderRadius: 8,
          padding: 16,
          backgroundColor: "white",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
        }}
      >
        <Text style={{ color: birthDate ? "#000" : "#999" }}>
          {birthDate && birthDate instanceof Date
            ? birthDate.toLocaleDateString("he-IL")
            : t("pets.birth_date_optional")}
        </Text>
        <Text style={{ color: "#666" }}>📅</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 12 }}>
        <Text style={{ marginBottom: 8, fontSize: 16, color: COLORS.dark }}>
          {t("pets.sex_optional")}
        </Text>
        <Menu
          visible={sexMenuVisible}
          onDismiss={() => setSexMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setSexMenuVisible(true)}
              style={{ justifyContent: "flex-start" }}
            >
              {sex ? t(`sex.${sex}`) : t("pets.sex_optional")}
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setSex("male");
              setSexMenuVisible(false);
            }}
            title={t("sex.male")}
          />
          <Menu.Item
            onPress={() => {
              setSex("female");
              setSexMenuVisible(false);
            }}
            title={t("sex.female")}
          />
          <Menu.Item
            onPress={() => {
              setSex("unknown");
              setSexMenuVisible(false);
            }}
            title={t("sex.unknown")}
          />
        </Menu>
      </View>

      <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
        <View style={{ flex: 1 }}>
          <TextInput
            label={t("pets.chip_number_optional")}
            value={chipNumber}
            onChangeText={setChipNumber}
            mode="outlined"
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextInput
            label={t("pets.color_optional")}
            value={color}
            onChangeText={setColor}
            mode="outlined"
          />
        </View>
      </View>

      <TextInput
        label={t("pets.notes_optional")}
        value={notes}
        onChangeText={setNotes}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={{ marginTop: 12, textAlignVertical: "top" }}
      />

      <Button
        mode="contained"
        onPress={submit}
        loading={loading}
        style={{ marginTop: 16, backgroundColor: COLORS.primary }}
      >
        {petId ? t("pets.update") : t("pets.create")}
      </Button>

      {showDatePicker && (
        <DateTimePicker
          value={birthDate instanceof Date ? birthDate : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      <Snackbar
        visible={!!err}
        onDismiss={() => setErr("")}
        action={{
          label: t("pets.confirm"),
          onPress: () => setErr(""),
        }}
      >
        {err}
      </Snackbar>
    </View>
  );
}
