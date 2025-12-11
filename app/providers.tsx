'use client';

import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* Add other providers here if needed */}
      {children}
    </SessionProvider>
  );
}