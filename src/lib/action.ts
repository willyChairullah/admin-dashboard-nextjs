import { schema } from "./schema";
import { executeAction } from "@/lib/executeAction";
import db from "./db";
import { v4 as uuid } from "uuid";

const signUp = async (formData: FormData) => {
  return executeAction({
    actionFn: async () => {
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      console.log("Sign up attempt:", { name, email, password: "***" });

      // Basic validation
      if (!name || !email || !password) {
        throw new Error("All fields are required");
      }

      // Check if user already exists
      const existingUser = await db.users.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Create user with required fields
      console.log("Creating user in database...");
      const newUser = await db.users.create({
        data: {
          id: uuid(), // Generate UUID for id
          name: name,
          email: email.toLowerCase(),
          password: password, // In production, this should be hashed
          updatedAt: new Date(), // Provide updatedAt since it's required
        },
      });

      console.log("User created successfully:", {
        id: newUser.id,
        email: newUser.email,
      });
    },
    successMessage: "Account created successfully",
  });
};

export { signUp };
