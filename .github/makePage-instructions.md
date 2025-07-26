Saya ingin membuat sebuah halaman CRUD dari database ini:

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

// Model ini menjadi pusat dari semua aktivitas di halaman "Manajemen Stok".
model StockMovements {
  id               String            @id @default(cuid())
  movementDate     DateTime          @default(now())
  type             StockMovementType // Enum ini menjadi kunci utama
  quantity         Float // Jumlah stok yang berubah
  previousStock    Int
  newStock         Int
  reference        String? // Bisa diisi ID Order, ID Produksi, atau catatan manual
  productionLogsItemsId String?
  ordersId         String?
  notes            String? // Catatan untuk penyesuaian
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  productId        String
  userId           String // User yang melakukan aksi
  products         Products          @relation(fields: [productId], references: [id])
  users            Users             @relation(fields: [userId], references: [id])
  productionLogItemId  ProductionLogItems?   @relation(fields: [productionLogsItemsId], references: [id]) // FK ke ProductionLogs
  orderId          Orders?           @relation(fields: [ordersId], references: [id]) // FK ke tabel Orders (jika ada)

  @@map("stock_movements")
}

Akan mencontoh dari folder halaman "/management/category"

Pada Sidebar Halaman akan diberi nama modul manajemen stok
Dimana halaman yang dibuat ini akan ditempatkan di path "inventory/manajemen-stok"
Dan baca pada layout.tsx akan memiliki data ini:
const myStaticData = {
module: "inventory",
subModule: "manajemen-stok",
allowedRole: ["OWNER", "WAREHOUSE", "ADMIN"],
data: await getCategories(), // sesuaikan dengan getpada data
};

buatkan semuanya lengkap sampai bisa CRUD Data