import { object, string } from "zod";

export const signInSchema = object({
  email: string()
    .nonempty({ message: "Email is required" })
    .email("Invalid email"),
  password: string()
    .nonempty({ message: "Password is required" })
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
});
