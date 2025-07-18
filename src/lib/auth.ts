import db from "./db";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { schema } from "./schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        console.log("Auth attempt with credentials:", {
          email: credentials?.email,
          password: credentials?.password ? "***" : "missing",
        });

        const validatedCredentials = schema.parse(credentials);

        const user = await db.users.findFirst({
          where: {
            email: validatedCredentials.email,
          },
        });

        console.log(
          "User found:",
          user
            ? {
                id: user.id,
                email: user.email,
                storedPassword: user.password ? "***" : "no password",
                inputPassword: validatedCredentials.password
                  ? "***"
                  : "no password",
              }
            : "No user found"
        );

        if (!user) {
          console.log("User not found - throwing error");
          throw new Error("Invalid credentials.");
        }

        // Compare passwords directly (since they're stored as plain text)
        if (user.password !== validatedCredentials.password) {
          console.log("Password mismatch - throwing error");
          throw new Error("Invalid credentials.");
        }

        console.log("Authentication successful for user:", user.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
});
