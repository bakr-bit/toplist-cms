import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

/**
 * Validates an API key from the X-API-Key header for service-to-service authentication.
 * This allows external services (like the content tool) to call the API without a session.
 */
export function isValidApiKey(request: Request): boolean {
  const apiKey = request.headers.get("X-API-Key");
  return !!apiKey && apiKey === process.env.SERVICE_API_KEY;
}

export function isAdmin(session: { user: { role?: string } }): boolean {
  return session.user.role === "admin";
}

export function canAccessSite(
  session: { user: { role?: string; sites?: string[] } },
  siteKey: string
): boolean {
  if (session.user.role === "admin") return true;
  return session.user.sites?.includes(siteKey) ?? false;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              sites: { select: { siteKey: true } },
            },
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            sites: user.sites.map((s) => s.siteKey),
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.sites = user.sites;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.sites = token.sites as string[];
      }
      return session;
    },
  },
};

// Extend next-auth types
declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    sites: string[];
  }
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      role: string;
      sites: string[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    sites: string[];
  }
}
