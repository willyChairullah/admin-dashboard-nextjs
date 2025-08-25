import { getTransactionHistory } from "@/lib/actions/transaction-history";
import { DataProvider } from "@/contexts/StaticData";
import { Toaster } from "sonner";

export default async function TransactionHistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const myStaticData = {
    module: "purchasing",
    subModule: "transaction-history",
    allowedRole: ["OWNER", "ADMIN"],
    data: await getTransactionHistory(),
  };

  return (
    <DataProvider data={myStaticData}>
      <div>
        {children}
        <Toaster
          duration={2300}
          theme="system"
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontSize: "14px",
              padding: "12px 16px",
            },
          }}
        />
      </div>
    </DataProvider>
  );
}
