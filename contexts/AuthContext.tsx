'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  image?: string | null;
}

interface Session {
  user: User;
  expires: string;
}

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: { name: string; email: string; password: string; role: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: nextAuthSession, status } = useSession();
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (nextAuthSession?.user) {
      setSession({
        user: {
          id: nextAuthSession.user.id || '',
          email: nextAuthSession.user.email || '',
          name: nextAuthSession.user.name,
          role: nextAuthSession.user.role || 'USER',
          image: nextAuthSession.user.image,
        },
        expires: nextAuthSession.expires || '',
      });
    } else {
      setSession(null);
    }
  }, [nextAuthSession]);

  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    router.refresh();
  };

  const logout = async () => {
    await signOut({ redirect: false });
    setSession(null);
    router.push('/');
    router.refresh();
  };

  const register = async (data: { name: string; email: string; password: string; role: string }) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
  };

  return (
    <AuthContext.Provider value={{
      session,
      loading: status === 'loading',
      login,
      logout,
      register,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}