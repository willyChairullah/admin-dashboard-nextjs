I want to create a CRUD page from this database:


model StockOpnames {
  id               String             @id @default(cuid())
  opnameDate       DateTime           @default(now())
  status           OpnameStatus       @default(IN_PROGRESS)
  notes            String?
  conductedById    String
  conductedBy      Users              @relation(fields: [conductedById], references: [id])
  stockOpnameItems StockOpnameItems[]

  @@map("stock_opnames")
}

model StockOpnameItems {
  id            String       @id @default(cuid())
  systemStock   Int
  physicalStock Int
  difference    Int
  opnameId      String
  productId     String
  stockOpname   StockOpnames @relation(fields: [opnameId], references: [id], onDelete: Cascade)
  product       Products     @relation(fields: [productId], references: [id])
  StockMovements StockMovements[]

  @@map("stock_opname_items")
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

Will reference the folder page "/inventori/produksi"

In the Sidebar Page, it will be named the "Stok Opname". The page created will be placed at the path "inventory/stok-opname" and read on layout.tsx will contain this data:
const myStaticData = {
module: "inventory",
subModule: "stok-opname",
allowedRole: ["OWNER", "WAREHOUSE", "ADMIN"],
data: await getCategories(), // adjust according to the data retrieval
};

Main Features:

Just Compare Stock in Databse with Real Stock (not automaticly change stock in database)

Stock Opname Form with the following options:
  
Opname Date  
Notes  
User performing the action  
List of Items that:

Select product  
Show database quantity product
Enter quantity  
Notes per item  
Data Storage:

Save to StockOpnames  
Save details to StockOpnamesItems

Example Scenarios:
Today Notes, Product A is 100 and in real stock is 90
to change different stock it is will do in modul manajemen-stok

Make everything complete so that it can CRUD the data.