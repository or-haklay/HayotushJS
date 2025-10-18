// hooks/useAuth.js
import { useState, useEffect } from "react";
import authService from "../services/authService";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Refresh auth header from storage first
        await authService.refreshAuthHeaderFromStorage();
        const currentUser = await authService.getUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to check authentication status", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  const loginWithGoogle = async ({ code, state, codeVerifier }) => {
    try {
      setIsLoading(true);

      // Get the redirect URI and client ID from the app config
      const redirectUri = "https://api.hayotush.com/api/auth/google/callback";
      const clientId =
        "387230820014-mc1s8vkumvl98m3e5s82qlevuhfetk3d.apps.googleusercontent.com";

      // Send the authorization code to the backend
      const response = await authService.oauthLogin("google", {
        code,
        redirectUri,
        clientId,
        state,
        codeVerifier, // Include PKCE code verifier
      });

      // Set the user after successful login
      const currentUser = await authService.getUser();
      setUser(currentUser);

      return response;
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { user, isLoading, loginWithGoogle };
};
