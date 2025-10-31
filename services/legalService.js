import httpServices from "./httpServices";

const legalService = {
  // Get active legal documents
  getActiveLegalDocuments: async (language) => {
    try {
      const params = language ? { language } : {};
      const response = await httpServices.get("/legal/active", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching active legal documents:", error);
      throw error.response?.data || error;
    }
  },

  // Get specific legal document by type and language
  getLegalDocumentByType: async (type, language) => {
    try {
      const response = await httpServices.get(`/legal/${type}/${language}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching legal document:", error);
      throw error.response?.data || error;
    }
  },

  // Check consent status
  checkConsentStatus: async () => {
    try {
      const response = await httpServices.get("/legal/consent-status");
      return response.data;
    } catch (error) {
      console.error("Error checking consent status:", error);
      throw error.response?.data || error;
    }
  },

  // Accept legal documents
  acceptLegalDocuments: async (
    termsVersion,
    privacyVersion,
    termsLanguage = "he",
    privacyLanguage = "he"
  ) => {
    try {
      const response = await httpServices.post("/legal/accept", {
        termsVersion,
        privacyVersion,
        termsLanguage,
        privacyLanguage,
      });
      return response.data;
    } catch (error) {
      console.error("Error accepting legal documents:", error);
      throw error.response?.data || error;
    }
  },
};

export default legalService;

