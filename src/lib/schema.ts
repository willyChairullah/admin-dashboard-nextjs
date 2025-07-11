import { z } from "zod";

export const schema = z.object({
  email: z.string().nonempty("Email is required").email("Invalid email format"),
  password: z
    .string()
    .nonempty("Password is required")
    .min(5, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
});