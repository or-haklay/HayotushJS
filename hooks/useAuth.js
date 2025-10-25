import { useState, useEffect, useCallback } from "react";
import authService from "../services/authService";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        const token = await authService.getJWT();
        if (token) {
          // Refresh auth header
          await authService.refreshAuthHeaderFromStorage();
          // Get user from token
          const userData = await authService.getUser();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error loading user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login with Google OAuth
  const loginWithGoogle = useCallback(
    async ({ code, state, codeVerifier, redirectUri, clientId, platform }) => {
      try {
        setIsLoading(true);

        console.log("🔍 loginWithGoogle received:", {
          code: code ? code.substring(0, 20) + "..." : "missing",
          redirectUri,
          clientId,
          platform,
          state: state ? state.substring(0, 20) + "..." : "missing",
        });

        const token = await authService.oauthLogin("google", {
          code,
          redirectUri,
          state,
          codeVerifier,
          clientId,
          platform,
        });

        if (token) {
          const userData = await authService.getUser();
          setUser(userData);
          return { success: true, user: userData };
        }
      } catch (error) {
        console.error("Google login error:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Regular email/password login
  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      const token = await authService.login(email, password);
      if (token) {
        const userData = await authService.getUser();
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }, []);

  // Create user (signup)
  const createUser = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      const result = await authService.createUser(userData);
      if (result?.token) {
        const userData = await authService.getUser();
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (error) {
      console.error("Create user error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    loginWithGoogle,
    login,
    logout,
    createUser,
    isAuthenticated: !!user,
  };
}
