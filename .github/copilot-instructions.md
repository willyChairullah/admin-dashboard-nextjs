I want to create a CRUD page from this database:

## Database

```

model Invoices {
  id              String         @id @default(cuid())
  code            String         @unique
  invoiceDate     DateTime       @default(now())
  dueDate         DateTime
  status          InvoiceStatus  @default(DRAFT)
  paymentStatus   PaymentStatus  @default(UNPAID)
  type            InvoiceType    @default(PRODUCT) // <--- Tambahan: Tipe invoice (PRODUCT/MANUAL)
  // isProforma      Boolean        @default(false)
  subtotal        Float          @default(0)
  tax             Float          @default(0)
  taxPercentage   Float          @default(0) // Tax percentage used to calculate tax amount
  discount        Float          @default(0)
  shippingCost    Float          @default(0) // <--- Tambahan: Biaya pengiriman
  totalAmount     Float          @default(0)
  paidAmount      Float          @default(0)
  remainingAmount Float          @default(0)
  deliveryAddress String?        // <--- Tambahan: Alamat pengiriman
  notes           String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  createdBy       String?
  updatedBy       String?
  customerId      String
  purchaseOrderId String?        @unique // <--- purchaseOrderId sudah cukup
  invoiceItems    InvoiceItems[]
  customer        Customers      @relation(fields: [customerId], references: [id])
  purchaseOrder   PurchaseOrders? @relation(fields: [purchaseOrderId], references: [id])
  payments        Payments[]
  salesReturns    SalesReturns[]

  creator         Users?         @relation("InvoiceCreator", fields: [createdBy], references: [id])
  updater         Users?         @relation("InvoiceUpdater", fields: [updatedBy], references: [id])

  @@map("invoices")
}

model InvoiceItems {
  id          String   @id @default(cuid())
  description String?  // <--- Tambahan: Untuk deskripsi item non-produk
  quantity    Float
  price       Float
  discount    Float    @default(0)
  totalPrice  Float
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  invoiceId   String
  productId   String?  // <--- Revisi: Dijadikan opsional untuk non-produk
  invoices    Invoices @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  products    Products? @relation(fields: [productId], references: [id])

  @@map("invoice_items")
}


model Payments {
  id              String         @id @default(cuid())
  paymentCode     String         @unique
  paymentDate     DateTime       @default(now())
  amount          Float
  method          String
  reference       String?
  notes           String?
  proofUrl        String?        // <--- Tambahan: URL ke file bukti pembayaran
  status          PaidStatus  @default(PENDING)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  invoiceId       String
  userId          String
  invoice         Invoices       @relation(fields: [invoiceId], references: [id])
  user            Users          @relation(fields: [userId], references: [id])

  @@map("payments")
}
```

## Reference

Consistance layout and style will reference the folder page "/inventori/produksi"
Use custom UI from component

## application flow:

1.Sales Order Created.
2.PO Created.
3.Warehouse Confirms Stock (PO/Order): Check the availability of quantity in the system. Stock has not decreased yet.
4.Invoice Created.
5.Payment an invoice.
6.Warehouse Confirms Readiness of Goods (After Invoice): Goods are prepared physically and the warehouse marks them as "Ready to Ship." Stock has not decreased yet.
7.Delivery Note Created: At this stage, the actual stock of Products will decrease. You will create a StockMovement entry of type SALES_OUT that references this Delivery Note.

## I want to make flow number 5

In the Sidebar Page, it will be named the "Pembayaran" module. The page created will be placed at the path "sales/pembayaran" and read on layout.tsx will contain this data:
const myStaticData = {
module: "sales",
subModule: "pembayaran",
allowedRole: ["OWNER", "ADMIN"],
data: await getCategories(), // adjust according to the data retrieval
};

### Main Features:

Choose payment in form create and add attachment then save into database,
and update column PaymentStatus in invoice table

### Data Storage:

Save to Payments and update Invoice PaymentStatus

### Example Scenarios:

Admin can create payment, and choose invoice want to pay, and fill nominal pay, nominal will auto fill suitable with totalAmount column in invoice

Admin can add attachment and others that need to be filled in the payment column

Make everything complete so that it can CRUD the data.