import db from "./db";
import NextAuth from "next-auth";
import { encode as defaultEncode } from "next-auth/jwt";
import { v4 as uuid } from "uuid";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { schema } from "./schema";

const adapter = PrismaAdapter(db);

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async credentials => {
        const validatedCredentials = schema.parse(credentials);

        const user = await db.user.findFirst({
          where: {
            email: validatedCredentials.email,
            password: validatedCredentials.password,
          },
        });

        if (!user) {
          throw new Error("Invalid credentials.");
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "credentials") {
        token.credentials = true;
      }
      return token;
    },
    // async session({ session, token }) {
    //   // console.log("🔄 Session callback called for user:", session.user?.id);

    //   if (session.user?.id) {
    //     try {
    //       // Fetch user with roles and permissions
    //       const userWithRoles = await db.user.findUnique({
    //         where: { id: session.user.id },
    //         include: {
    //           roles: {
    //             include: {
    //               role_permissions: {
    //                 include: {
    //                   permission: true,
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       });

    //       if (userWithRoles) {
    //         session.user = userWithRoles;
    //       }
    //     } catch (error) {
    //       console.error("❌ Error fetching user roles:", error);
    //     }
    //   }
    //   return session;
    // },
  },
  jwt: {
    encode: async function (params) {
      if (params.token?.credentials) {
        const sessionToken = uuid();

        if (!params.token.sub) {
          throw new Error("No user ID found in token");
        }

        const createdSession = await adapter?.createSession?.({
          sessionToken: sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        if (!createdSession) {
          throw new Error("Failed to create session");
        }

        return sessionToken;
      }
      return defaultEncode(params);
    },
  },
});
