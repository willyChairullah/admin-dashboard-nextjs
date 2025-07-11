import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import db from "./db";
export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async credentials => {
        const user = await db.users.findFirst({
          where: {
            email: credentials.email,
            password_hash: credentials.password,
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
