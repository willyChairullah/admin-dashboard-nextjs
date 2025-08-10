// app/inventory/konfirmasi-stok/layout.tsx

import React from "react"; // Essential for JSX in Next.js 13+ App Router

import { getPurchaseOrdersForConfirmation, PurchaseOrderForConfirmation } from "@/lib/actions/stockConfirmation";
import { DataProvider } from "@/contexts/StaticData";
import { Toaster } from "sonner";

export default async function KonfirmasiStokLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Data defined or fetched on the server side with error handling
  let purchaseOrdersData: PurchaseOrderForConfirmation[] = [];
  
  try {
    purchaseOrdersData = await getPurchaseOrdersForConfirmation();
  } catch (error) {
    console.error("Failed to fetch purchase orders for confirmation:", error);
    // Use empty array as fallback during build time
    purchaseOrdersData = [];
  }

  const myStaticData = {
    module: "inventory",
    subModule: "konfirmasi-stok",
    allowedRole: ["OWNER", "ADMIN", "WAREHOUSE"],
    data: purchaseOrdersData,
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
