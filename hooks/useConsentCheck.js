import { useState, useEffect } from "react";
import legalService from "../services/legalService";

/**
 * Hook to check if user needs to accept updated legal documents
 * Returns consent status and required documents
 */
const useConsentCheck = () => {
  const [needsConsent, setNeedsConsent] = useState(false);
  const [requiredDocuments, setRequiredDocuments] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkConsent = async () => {
    try {
      setLoading(true);
      const response = await legalService.checkConsentStatus();
      
      if (response.needsConsentUpdate) {
        setNeedsConsent(true);
        setRequiredDocuments(response.activeDocuments);
      } else {
        setNeedsConsent(false);
        setRequiredDocuments(null);
      }
    } catch (error) {
      console.error("Error checking consent status:", error);
      // Don't block the app if there's an error
      setNeedsConsent(false);
    } finally {
      setLoading(false);
    }
  };

  const acceptConsent = async (versions) => {
    try {
      await legalService.acceptLegalDocuments(
        versions.termsVersion,
        versions.privacyVersion,
        versions.termsLanguage,
        versions.privacyLanguage
      );
      setNeedsConsent(false);
      setRequiredDocuments(null);
      return true;
    } catch (error) {
      console.error("Error accepting legal documents:", error);
      throw error;
    }
  };

  useEffect(() => {
    checkConsent();
  }, []);

  return {
    needsConsent,
    requiredDocuments,
    loading,
    checkConsent,
    acceptConsent,
  };
};

export default useConsentCheck;

