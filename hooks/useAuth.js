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

  return { user, isLoading };
};
