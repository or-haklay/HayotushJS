import React, { useEffect, useState } from "react";
import { View, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, TextInput, Button, Snackbar } from "react-native-paper";
import uploadService from "../../services/uploadService";
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
  const [selectedImage, setSelectedImage] = useState(null); // שינוי מ-URL לקובץ
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [currentPetImage, setCurrentPetImage] = useState(null); // תמונה נוכחית של החיה

  useEffect(() => {
    (async () => {
      if (!petId) return;
      try {
        const p = await petService.getPetById(petId);
        setName(p.name || "");
        setSpecies(p.species || "dog");
        setBreed(p.breed || "");
        setChipNumber(p.chipNumber || "");
        setCurrentPetImage(p.profilePictureUrl || null); // שמירת התמונה הנוכחית
      } catch {
        setErr(t("pets.edit_load_error"));
      }
    })();
  }, [petId]);

  const handlePickImage = async () => {
    const image = await uploadService.pickImage();
    if (image) {
      setSelectedImage(image);
    }
  };

  const submit = async () => {
    if (!name.trim()) return setErr(t("pets.name_required"));
    if (!species.trim()) return setErr(t("pets.species_required"));

    setLoading(true);
    try {
      let profilePictureUrl = undefined;

      // אם המשתמש בחר תמונה חדשה, נעלה אותה ל-S3
      if (selectedImage) {
        const uploadResult = await uploadService.uploadPetPicture(
          selectedImage
        );

        if (uploadResult && uploadResult.success) {
          profilePictureUrl = uploadResult.fileUrl;

          // מחיקת התמונה הישנה מ-S3 אם יש כזו
          if (currentPetImage) {
            await uploadService.deleteOldImage(currentPetImage);
          }
        } else {
          console.error("Upload failed:", uploadResult);
          setErr(t("pets.image_upload_error"));
          setLoading(false);
          return;
        }
      }

      const payload = {
        name: name.trim(),
        species: species.trim(),
        breed: breed?.trim() || undefined,
        chipNumber: chipNumber?.trim() || undefined,
        profilePictureUrl: profilePictureUrl || currentPetImage, // שמירה על התמונה הקיימת אם אין חדשה
      };

      if (petId) {
        await petService.updatePet(petId, payload);
        showSuccess(t("toast.success.pet_updated"));
      } else {
        await petService.createPet(payload);
        showSuccess(t("toast.success.pet_created"));
      }

      // איפוס התמונה הנבחרת אחרי שמירה מוצלחת
      setSelectedImage(null);
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
      <TextInput
        label={t("pets.species")}
        value={species}
        onChangeText={setSpecies}
        mode="outlined"
        style={{ marginTop: 12 }}
      />
      <TextInput
        label={t("pets.breed_optional")}
        value={breed}
        onChangeText={setBreed}
        mode="outlined"
        style={{ marginTop: 12 }}
      />
      <TextInput
        label={t("pets.chip_number_optional")}
        value={chipNumber}
        onChangeText={setChipNumber}
        mode="outlined"
        style={{ marginTop: 12 }}
      />

      {/* שדה תמונה - עכשיו עם קובץ */}
      <View style={{ marginTop: 12 }}>
        <Text style={{ marginBottom: 8, fontSize: 16, fontWeight: "600" }}>
          {t("pets.profile_picture")}
        </Text>

        {/* הצגת התמונה הנוכחית אם יש כזו */}
        {currentPetImage && !selectedImage && (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ marginBottom: 8, fontSize: 14, color: "#666" }}>
              {t("pets.current_image")}:
            </Text>
            <Image
              source={{ uri: currentPetImage }}
              style={{ width: 100, height: 100, borderRadius: 8 }}
              resizeMode="cover"
            />
          </View>
        )}

        {selectedImage ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
              gap: 12,
            }}
          >
            <Text numberOfLines={1} style={{ flex: 1 }}>
              {selectedImage.name || t("pets.selected_image")}
            </Text>
            <Button
              mode="outlined"
              onPress={() => setSelectedImage(null)}
              compact
            >
              {t("pets.remove")}
            </Button>
          </View>
        ) : null}

        <Button mode="outlined" onPress={handlePickImage}>
          {selectedImage ? t("pets.change_image") : t("pets.choose_image")}
        </Button>
      </View>

      <Button
        mode="contained"
        onPress={submit}
        loading={loading}
        style={{ marginTop: 24 }}
      >
        {petId ? t("pets.update") : t("pets.create")}
      </Button>

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
