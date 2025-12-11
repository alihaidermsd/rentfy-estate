import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginSchema, registerSchema, resetPasswordSchema } from "@/lib/validations";
import { z } from "zod";

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export const useAuth = () => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      loginSchema.parse(credentials);
      
      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      router.push("/dashboard");
      return { success: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Fixed: Use issues instead of errors
        const validationError = error.issues[0]?.message || "Validation failed";
        setError(validationError);
        return { success: false, error: validationError };
      }
      setError("Login failed");
      return { success: false, error: "Login failed" };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      registerSchema.parse(userData);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Auto-login after successful registration
      await login({
        email: userData.email,
        password: userData.password,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      resetPasswordSchema.parse({ email });

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Password reset failed");
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Password reset failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    user: session?.user,
    isLoading,
    error,
    isAuthenticated: !!session,
    status,
    
    // Actions
    login,
    register,
    logout,
    resetPassword,
    updateSession: update,
    
    // Utilities
    hasRole: (role: string) => session?.user?.role === role,
    isAdmin: () => session?.user?.role === "ADMIN",
  };
};