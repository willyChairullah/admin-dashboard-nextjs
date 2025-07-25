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

export async function getUsers() {
  try {
    const users = await db.users.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export async function getUserById(id: string) {
  try {
    const user = await db.users.findUnique({
      where: {
        id,
      },
    });
    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
}

export async function updateUser({
  id,
  name,
  email,
  role,
  password,
  isActive,
}: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  isActive: boolean;
}) {
  // validate required fields
  if (!id || !name || !email || !role) {
    return {
      success: false,
      error: "Missing required fields",
    };
  }

  try {
    const updateData: any = {
      name,
      email,
      role: role as UserRole,
      isActive,
    };

    // Only update password if provided
    if (password && password.trim()) {
      updateData.password = password;
    }

    await db.users.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/management/users");
    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to update user:", error);
    return {
      success: false,
      error: "Failed to update user",
    };
  }
}
