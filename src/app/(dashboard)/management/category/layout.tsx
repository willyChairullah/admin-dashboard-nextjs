// app/layout.tsx

import React from "react"; // Essential for JSX in Next.js 13+ App Router

import { getCategories } from "@/lib/actions/categories";
import { DataProvider } from "@/contexts/StaticData"; // <-- Corrected import path

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Data defined or fetched on the server side
  const myStaticData = {
    module: "management",
    subModule: "category",
    allowedRole: ["OWNER", "ADMIN"],
    categoriesData: await getCategories(), // Await the async function
  };

  return (
    // Wrap children with your DataProvider
    <DataProvider data={myStaticData}>
      <div>{children}</div> {/* <-- Removed extra semicolon here */}
    </DataProvider>
  );
}
