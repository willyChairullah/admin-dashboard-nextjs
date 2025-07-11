import db from "./db";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { schema } from "./schema";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: {
          type: "email",
          label: "Email",
          placeholder: "johndoe@gmail.com",
        },
        password: {
          type: "password",
          label: "Password",
          placeholder: "*****",
        },
      },
      authorize: async credentials => {
        const validateCredential = await schema.parseAsync(credentials);

        const user = await db.user.findFirst({
          where: {
            email: validateCredential.email,
            password: validateCredential.password,
          },
        });

        if (!user) {
          throw new Error("invalid credentials");
        }
        return user;

        // const email = "admin@admin.com";
        // const password = "admin";
        // if (credentials.email === email && credentials.password === password) {
        //   return { email, password };
        // } else {
        //   throw new Error("Invalid Credentials");
        // }
      },
    }),
  ],
});
