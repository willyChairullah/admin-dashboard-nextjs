I want to create a CRUD page from this database:

model ManagementStocks {
id String @id @default(cuid())
// batchNumber String @unique
managementDate DateTime @default(now())
status ManagementStockStatus @default(IN)
notes String?
producedById String
producedBy Users @relation(fields: [producedById], references: [id])
items ManagementStockItems[]

@@map("management_stocks")
}

model ManagementStockItems {
id String @id @default(cuid())
quantity Float
managementStockId String
productId String
managementStock ManagementStocks @relation(fields: [managementStockId], references: [id], onDelete: Cascade)
product Products @relation(fields: [productId], references: [id])
StockMovements StockMovements[]

@@map("management_stock_items")
}

model StockMovements {
id String @id @default(cuid())
movementDate DateTime @default(now())
type StockMovementType Read and understand all the instructions first, then proceed with the tasks.
quantity Float
previousStock Int
newStock Int
reference String? // Bisa diisi ID Order, ID Produksi, atau catatan manual
productionLogsItemsId String?
ordersId String?
notes String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
productId String
userId String
products Products @relation(fields: [productId], references: [id])
users Users @relation(fields: [userId], references: [id])
productionLogItemId ProductionLogItems? @relation(fields: [productionLogsItemsId], references: [id])
orderId Orders? @relation(fields: [ordersId], references: [id]) // FK ke tabel Orders (jika ada)

@@map("stock_movements")
}

Will reference the folder page "/inventori/produksi"

In the Sidebar Page, it will be named the stock management module. The page created will be placed at the path "inventory/manajemen-stok" and read on layout.tsx will contain this data:
const myStaticData = {
module: "inventory",
subModule: "manajemen-stok",
allowedRole: ["OWNER", "WAREHOUSE", "ADMIN"],
data: await getCategories(), // adjust according to the data retrieval
};

Main Features:

Inventory Adjustment In - Increase stock through Adjustment  
Inventory Adjustment Out - Decrease stock through Adjustment

Stock Management Form with the following options:

Type: Stock Management  
Production Date  
Notes  
User performing the action  
List of Items that can be added/removed:

Select product  
Enter quantity  
Notes per item  
Data Storage:

Save to ManagementStocks  
Save details to ManagementStockItems  
Automatically create StockMovements with type ADJUSTMENT_IN / ADJUSTMENT_OUT  
Automatically update product stock  
Example Scenarios:

Adjustment In: Today, added 100 units of Product A  
Adjustment Out: Today, reduced 50 units of Product B

Make everything complete so that it can CRUD the data.
