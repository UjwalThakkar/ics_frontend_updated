"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { phpAPI } from "@/lib/php-api-client";

interface User {
  id: string;
  username: string;
  role: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendRegistrationOtp: (
    first_name: string,
    last_name: string,
    email: string,
  ) => Promise<{ success: boolean; error?: string; expiresAt?: string }>;
  regenerateRegistrationOtp: (
    first_name: string,
    last_name: string,
    email: string,
  ) => Promise<{ success: boolean; error?: string; expiresAt?: string }>;
  register: (
    first_name: string,
    last_name: string,
    email: string,
    phone: string,
    password: string,
    otp: string,
  ) => Promise<{ success: boolean; error?: string }>;
  login: (
    type: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state by verifying cookie with backend
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // We attempt to fetch user details. If the cookie is valid, this succeeds.
        const { data } = await phpAPI.getUserDetails();

        if (data && data.user) {
          setUser(data.user);
          setToken("valid-session"); // Dummy token to satisfy interface
        } else {
          // Explicitly clear any stale data
          localStorage.removeItem("user");
          localStorage.removeItem("auth_token");
        }
      } catch (error) {
        console.warn("Auth initialization failed (likely not logged in)", error);
        // Clear invalid data
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const sendRegistrationOtp = async (
    first_name: string,
    last_name: string,
    email: string,
  ): Promise<{ success: boolean; error?: string; expiresAt?: string }> => {
    try {
      setIsLoading(true);
      console.log(" AuthContext: Sending registration OTP...");

      const response = await phpAPI.sendRegistrationOtp(email, first_name, last_name);

      if (response.success) {
        console.log(" AuthContext: OTP sent successfully");
        return { success: true, expiresAt: response.expiresAt };
      } else {
        console.error(" AuthContext: Failed to send OTP", response.error);
        return {
          success: false,
          error: response.error || "Failed to send OTP. Please try again.",
        };
      }
    } catch (error: any) {
      console.error(" AuthContext: Send OTP error", error);

      let errorMessage =
        "Unable to connect to the server. Please try again later.";

      if (error.message?.includes("fetch")) {
        errorMessage =
          "Cannot connect to authentication server. Please ensure the backend is running.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateRegistrationOtp = async (
    first_name: string,
    last_name: string,
    email: string,
  ): Promise<{ success: boolean; error?: string; expiresAt?: string }> => {
    try {
      setIsLoading(true);
      console.log(" AuthContext: Regenerating registration OTP...");

      const response = await phpAPI.regenerateRegistrationOtp(email, first_name, last_name);

      if (response.success) {
        console.log(" AuthContext: OTP regenerated successfully");
        return { success: true, expiresAt: response.expiresAt };
      } else {
        console.error(" AuthContext: Failed to regenerate OTP", response.error);
        return {
          success: false,
          error: response.error || "Failed to regenerate OTP. Please try again.",
        };
      }
    } catch (error: any) {
      console.error(" AuthContext: Regenerate OTP error", error);

      let errorMessage =
        "Unable to connect to the server. Please try again later.";

      if (error.message?.includes("fetch")) {
        errorMessage =
          "Cannot connect to authentication server. Please ensure the backend is running.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    first_name: string,
    last_name: string,
    email: string,
    phone: string,
    password: string,
    otp: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      console.log(" AuthContext: Initiating registration with OTP...");

      const response = await phpAPI.register(
        first_name,
        last_name,
        email,
        phone,
        password,
        otp
      );

      if (response.success) {
        const { user: userData } = response;
        console.log(" AuthContext: Registration successful", {
          user: userData,
        });
        return { success: true };
      } else {
        console.error(" AuthContext: Registration failed", response.error);
        return {
          success: false,
          error:
            response.error?.message ||
            "Registration failed. Please check your details.",
        };
      }
    } catch (error: any) {
      console.error(" AuthContext: Registration error", error);

      let errorMessage =
        "Unable to connect to the server. Please try again later.";

      if (error.message?.includes("fetch")) {
        errorMessage =
          "Cannot connect to authentication server. Please ensure the backend is running.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    type: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      console.log("🔐 AuthContext: Initiating login...");

      // phpAPI.login throws an error if login fails
      const response = await phpAPI.login(type as "user" | "admin", email, password);

      // If we reach here, login was successful
      const { user: userData } = response;

      setToken("valid-session"); // Dummy token
      setUser(userData as any); // Cast because User interface might not match exactly

      console.log("✅ AuthContext: Login successful", { user: userData });

      return { success: true };
    } catch (error: any) {
      console.error("❌ AuthContext: Login error", error);

      // Provide user-friendly error messages
      let errorMessage =
        "Unable to connect to the server. Please try again later.";

      if (error.message?.includes("fetch")) {
        errorMessage =
          "Cannot connect to authentication server. Please ensure the backend is running.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log("🚪 AuthContext: Logging out...");
    phpAPI.logout();
    setUser(null);
    setToken(null);
  };

  const refreshUser = () => {
    // Refresh user data from localStorage
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    sendRegistrationOtp,
    regenerateRegistrationOtp,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
