I want to create a CRUD page from this database:

model ProductionLogs {
  id             String               @id @default(cuid())
  // batchNumber    String               @unique
  productionDate DateTime             @default(now())
  status         ProductionStatus     @default(COMPLETED)
  notes          String?
  producedById   String
  producedBy     Users                @relation(fields: [producedById], references: [id])
  items          ProductionLogItems[]

  @@map("production_logs")
}

model ProductionLogItems {
  id              String         @id @default(cuid())
  quantity        Float
  productionLogId String
  productId       String
  productionLog   ProductionLogs @relation(fields: [productionLogId], references: [id], onDelete: Cascade)
  product         Products       @relation(fields: [productId], references: [id])
  StockMovements StockMovements[]

  @@map("production_log_items")
}

model StockMovements {
  id               String            @id @default(cuid())
  movementDate     DateTime          @default(now())
  type             StockMovementType Read and understand all the instructions first, then proceed with the tasks.
  quantity         Float 
  previousStock    Int
  newStock         Int
  reference        String? // Bisa diisi ID Order, ID Produksi, atau catatan manual
  productionLogsItemsId String?
  ordersId         String?
  notes            String? 
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  productId        String
  userId           String 
  products         Products          @relation(fields: [productId], references: [id])
  users            Users             @relation(fields: [userId], references: [id])
  productionLogItemId  ProductionLogItems?   @relation(fields: [productionLogsItemsId], references: [id]) 
  orderId          Orders?           @relation(fields: [ordersId], references: [id]) // FK ke tabel Orders (jika ada)

  @@map("stock_movements")
}

Will reference the folder page "/management/kategori"

In the Sidebar Page, it will be named the stock management module. The page created will be placed at the path "inventory/manajemen-stok" and read on layout.tsx will contain this data:
const myStaticData = {
module: "inventory",
subModule: "manajemen-stok",
allowedRole: ["OWNER", "WAREHOUSE", "ADMIN"],
data: await getCategories(), // adjust according to the data retrieval
};

Main Features:

Production In - Adding stock from production results

Production Form with options:

Type: Production In
Production Date
Notes
User performing the action
List of Items that can be added/removed:

Select product
Input quantity
Notes per item
Data Storage:

Save to ProductionLogs
Save details to ProductionLogItems
Automatically create StockMovements with type PRODUCTION_IN
Automatically update product stock
Example Scenario:

Production In: Today producing 100 units of Product A
Is this understanding correct? If so, I will create a system that supports both types of production (in and out) with a flexible form to add multiple items in a single production log.

Make everything complete so that it can CRUD the data.