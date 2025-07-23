Saya ingin membuat sebuah halaman CRUD dari database ini:

model Products {
  id             String           @id @default(cuid())
  name           String
  description    String?
  unit           String
  price          Float
  cost           Float
  minStock       Int              @default(0)
  currentStock   Int              @default(0)
  isActive       Boolean          @default(true)
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  categoryId     String
  invoiceItems   InvoiceItems[]
  orderItems     OrderItems[]
  category       Categories       @relation(fields: [categoryId], references: [id])
  stockMovements StockMovements[]

  @@map("products")
}

Akan mencontoh dari folder halaman "/management/category"
Dimana halaman ini akan ditempatkan di path "management/product"
Dan baca pada layout.tsx akan memiliki data ini:
  const myStaticData = {
    module: "management",
    subModule: "product",
    allowedRole: ["OWNER", "ADMIN"],
    data: await getCategories(), // Await the async function
  };

Dihalaman product/page.tsx :
columns yang akan berisi name, price, minStock
exlcudeAccessors berisi nname, price, minStock

Pada halaman create pada management form itu tombol delete dihapus
buatkan semuanya lengkap sampai bisa CRUD Data