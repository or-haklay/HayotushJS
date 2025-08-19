import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import httpServices from "./httpServices";

class UploadService {
  // בחירת תמונה מהגלריה
  async pickImage(aspectRatio = [1, 1]) {
    try {
      // בדיקה שהמודול זמין
      if (!ImagePicker || !ImagePicker.MediaTypeOptions) {
        console.error("ImagePicker module not properly loaded:", ImagePicker);
        throw new Error("ImagePicker module not available");
      }

      // בדיקת הרשאות
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        console.error("Media library permission not granted:", status);
        throw new Error("Media library permission not granted");
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: aspectRatio,
        quality: 0.8,
      });

      if (!result.canceled) {
        return result.assets[0];
      }
      return null;
    } catch (error) {
      console.error("Error picking image:", error);
      return null;
    }
  }

  // בחירת תמונת פרופיל (ריבועית)
  async pickProfileImage() {
    return this.pickImage([1, 1]);
  }

  // בחירת תמונת רקע (מלבנית)
  async pickCoverImage() {
    return this.pickImage([16, 9]); // יחס 16:9 שמתאים לתמונת רקע
  }

  // בחירת מסמך PDF
  async pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        return result.assets[0];
      }
      return null;
    } catch (error) {
      console.error("Error picking document:", error);
      return null;
    }
  }

  // העלאת קובץ לשרת
  async uploadFile(file, type, onProgress) {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        type: file.mimeType || "image/jpeg",
        name: file.name || "file.jpg",
      });

      const response = await httpServices.post(`/upload/${type}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  // בדיקת נגישות של תמונה/קובץ
  async checkImageAccessibility(imageUrl) {
    try {
      const response = await fetch(imageUrl, { method: "HEAD" });
      return response.ok;
    } catch (error) {
      console.error("Error checking image accessibility:", error);
      return false;
    }
  }

  // העלאת תמונת פרופיל
  async uploadProfilePicture(image, onProgress) {
    if (image) {
      try {
        const result = await this.uploadFile(
          image,
          "profile-picture",
          onProgress
        );

        // בדוק שהתמונה נגישה
        if (result && result.fileUrl) {
          const isAccessible = await this.checkImageAccessibility(
            result.fileUrl
          );
          if (!isAccessible) {
            console.warn("Uploaded image is not accessible:", result.fileUrl);
          }
        }

        return result;
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        throw error;
      }
    }
    return null;
  }

  // העלאת תמונת חיה
  async uploadPetPicture(image, onProgress) {
    if (image) {
      try {
        const result = await this.uploadFile(image, "pet-picture", onProgress);

        // בדוק שהתמונה נגישה
        if (result && result.fileUrl) {
          const isAccessible = await this.checkImageAccessibility(
            result.fileUrl
          );
          if (!isAccessible) {
            console.warn("Uploaded image is not accessible:", result.fileUrl);
          }
        }

        return result;
      } catch (error) {
        console.error("Error uploading pet picture:", error);
        throw error;
      }
    }
    return null;
  }

  // העלאת תמונת רקע של חיה
  async uploadPetCoverPicture(image, onProgress) {
    if (image) {
      try {
        const result = await this.uploadFile(image, "pet-cover", onProgress);

        // בדוק שהתמונה נגישה
        if (result && result.fileUrl) {
          const isAccessible = await this.checkImageAccessibility(
            result.fileUrl
          );
          if (!isAccessible) {
            console.warn(
              "Uploaded pet cover image is not accessible:",
              result.fileUrl
            );
          }
        }

        return result;
      } catch (error) {
        console.error("Error uploading pet cover picture:", error);
        throw error;
      }
    }
    return null;
  }

  // מחיקת תמונה ישנה מ-S3
  async deleteOldImage(imageUrl) {
    try {
      if (!imageUrl) return;

      const response = await httpServices.delete("/upload/file", {
        data: { fileUrl: imageUrl },
      });

      return response.data;
    } catch (error) {
      console.error("Error deleting old image:", error);
      // לא נזרוק שגיאה כי זה לא קריטי
      return null;
    }
  }

  // העלאת מסמך רפואי: ניתן להעביר קובץ ישירות או לאפשר בחירה פנימית
  async uploadMedicalDocument(fileOrOnProgress, maybeOnProgress) {
    try {
      let file = null;
      let onProgress = null;

      if (fileOrOnProgress && fileOrOnProgress.uri) {
        file = fileOrOnProgress;
        onProgress = maybeOnProgress || null;
      } else {
        onProgress = fileOrOnProgress || null;
        file = await this.pickDocument();
      }

      if (!file) return null;

      const result = await this.uploadFile(
        file,
        "medical-document",
        onProgress
      );

      // בדוק שהקובץ נגיש
      if (result && result.fileUrl) {
        const isAccessible = await this.checkImageAccessibility(result.fileUrl);
        if (!isAccessible) {
          console.warn(
            "Uploaded medical document is not accessible:",
            result.fileUrl
          );
        }
      }

      return result;
    } catch (error) {
      console.error("Error uploading medical document:", error);
      throw error;
    }
  }
}

export default new UploadService();
