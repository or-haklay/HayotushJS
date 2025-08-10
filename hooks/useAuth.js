// hooks/useAuth.js
import { useState, useEffect } from "react";
import authService from "../services/authService"; // ודא שהנתיב ל-authService נכון

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
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
  }, []); // המערך הריק גורם לזה לרוץ רק פעם אחת כשהאפליקציה נטענת

  return { user, isLoading };
};
