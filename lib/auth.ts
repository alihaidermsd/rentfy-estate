import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('[AUTH] Authorize function initiated.');
        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] Missing email or password.');
          return null;
        }
        console.log(`[AUTH] Attempting to find user with email: ${credentials.email}`);

        const email = String(credentials.email).toLowerCase()
        let user = null
        try {
          user = await prisma.user.findUnique({ where: { email } })
        } catch (e: any) {
          if (process.env.NODE_ENV !== 'production' && e?.code === 'P2021') {
            // If schema/tables are missing in dev, attempt to create them and retry once
            try {
              // run db push synchronously
              const { execSync } = require('child_process')
              execSync('npx prisma db push', { stdio: 'inherit' })
              user = await prisma.user.findUnique({ where: { email } })
            } catch (err) {
              console.error('Prisma recovery failed in auth authorize:', err)
            }
          } else {
            throw e
          }
        }

        if (!user) {
          console.log(`[AUTH] User not found in database for email: ${credentials.email}`);
          return null;
        }
        console.log('[AUTH] User found in database:', { id: user.id, email: user.email, role: user.role });

        if (!user.password) {
          console.log(`[AUTH] User ${user.email} found, but has no password set.`);
          return null;
        }
        console.log(`[AUTH] User has a password hash.`);

        const isPasswordValid = await compare(credentials.password, user.password);
        console.log(`[AUTH] Password validation result for ${user.email}: ${isPasswordValid}`);

        if (!isPasswordValid) {
          console.log(`[AUTH] Invalid password for user ${user.email}.`);
          return null;
        }

        console.log(`[AUTH] Login successful for ${user.email}. Returning user object.`);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: (user as any).role,
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
        }
      };
    },
  }
};