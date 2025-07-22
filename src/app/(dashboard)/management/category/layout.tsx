import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session) redirect("/sign-in");
  return <div>{children}</div>;
}
