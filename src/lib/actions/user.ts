"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";

export async function createUser({
  name,
  email,
  role,
  password,
}: {
  name: string;
  email: string;
  role: UserRole;
  password: string;
}) {
  // validate required fields
  if (!name || !email || !role || !password) {
    return {
      success: false,
      error: "Missing required fields",
    };
  }
  try {
    await db.users.create({
      data: {
        name,
        email,
        role: role as UserRole,
        password,
      },
    });
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to create user",
    };
  }
}
