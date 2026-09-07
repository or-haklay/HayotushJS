import { useState, useEffect, useCallback } from "react";
import authService from "../services/authService";
import { getFirebaseAuth } from "../services/firebaseClient";
import {
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";

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

  // Login with Google via Firebase Auth (using native Google Sign-In idToken)
  const loginWithGoogle = useCallback(
    async ({ idToken }) => {
      try {
        setIsLoading(true);

        if (!idToken) {
          throw new Error("Missing Google idToken");
        }

        const firebaseAuth = getFirebaseAuth();
        const credential = GoogleAuthProvider.credential(idToken);

        // Sign in to Firebase with Google credential
        const userCredential = await signInWithCredential(
          firebaseAuth,
          credential
        );

        const firebaseIdToken = await userCredential.user.getIdToken();

        // Exchange Firebase ID token for app JWT via backend
        const token = await authService.oauthLogin("firebase", {
          idToken: firebaseIdToken,
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
