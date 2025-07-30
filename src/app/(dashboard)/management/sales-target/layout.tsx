// app/layout.tsx

import React from "react"; // Essential for JSX in Next.js 13+ App Router

import { getSalesTargets, getSalesUsers } from "@/lib/actions/sales-targets";
import { DataProvider } from "@/contexts/StaticData";
import { Toaster } from "sonner";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Data defined or fetched on the server side
  const myStaticData = {
    module: "management",
    subModule: "sales-target",
    allowedRole: ["OWNER", "ADMIN"],
    data: await getSalesTargets(),
    salesUsers: await getSalesUsers(), // Get sales users for form dropdowns
  };

  return (
    // Wrap children with your DataProvider
    <DataProvider data={myStaticData}>
      <div>
        {children}
        <Toaster
          duration={2300}
          theme="system"
          position="top-right"
          offset={{ top: "135px" }}
          swipeDirections={["right"]}
          closeButton
          richColors
        />
      </div>
    </DataProvider>
  );
}
