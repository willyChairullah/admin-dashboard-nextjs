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
Pada path root akan memiliki komponen ini, lengkapnya baca Page.tsx nya:
<ManagementHeader mainPageName="/management/category" allowedRoles={["ADMIN"]} />
<ManagementContent
sampleData={sampleData}
columns={columns}
excludedAccessors={excludedAccessors}

dimana untuk mainPageName akan menjadi "/management/product" 
allowedRoles akan berisi ["ADMIN", "OWNER"]

sampleData akan diambil dari fetch data dari database model product
columns yang akan berisi name, description, isActive
exlcudeAccessors berisi name, description, isActive

pada folder /management/category akan ada folder create berisi sebuah form untuk memasukkan data
Disitu terdapat form dan semua komponen input yang dibutuhkan sesuaikan agar bisa create di halaman tersebut
dan tolong buatkan folder edit untuk halaman edit,

buatkan semuanya lengkap sampai bisa CRUD Data