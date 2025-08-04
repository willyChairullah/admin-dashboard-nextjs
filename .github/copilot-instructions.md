I want to create a CRUD page from this database:

## Database
```
model Invoices {
  id                  String          @id @default(cuid())
  code                String          @unique
  invoiceDate         DateTime        @default(now())
  dueDate             DateTime
  status              InvoiceStatus   @default(DRAFT)      // Status dokumen: DRAFT, SENT, PAID, OVERDUE, CANCELLED
  paymentStatus       PaymentStatus   @default(UNPAID)     // <--- Tambahan: Enum Status Pembayaran
  isProforma          Boolean         @default(false)      // <--- Tambahan: Untuk Proforma Invoice
  subtotal            Float           @default(0)
  tax                 Float           @default(0)
  discount            Float           @default(0)          // <--- Tambahan: Diskon level Invoice
  totalAmount         Float           @default(0)
  paidAmount          Float           @default(0)
  remainingAmount     Float           @default(0)
  notes               String?
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt
  createdBy           String?                               // <--- Tambahan: ID User Pembuat Invoice
  updatedBy           String?                               // <--- Tambahan: ID User Update Terakhir Invoice
  customerId          String
  orderId             String?         @unique
  invoiceItems        InvoiceItems[]
  customer            Customers       @relation(fields: [customerId], references: [id])
  order               Orders?         @relation(fields: [orderId], references: [id])
  payments            Payments[]
  salesReturns        SalesReturns[]

  creator             Users?          @relation("InvoiceCreator", fields: [createdBy], references: [id])
  updater             Users?          @relation("InvoiceUpdater", fields: [updatedBy], references: [id])

  @@map("invoices")
}

model InvoiceItems {
  id         String   @id @default(cuid())
  quantity   Float
  price      Float
  discount   Float    @default(0) // <--- Tambahan: Diskon per item
  totalPrice Float    // Ini akan dihitung sebagai (quantity * price) - discount
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  invoiceId  String
  productId  String
  invoices   Invoices @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  products   Products @relation(fields: [productId], references: [id])

  @@map("invoice_items")
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
5.Warehouse Confirms Readiness of Goods (After Invoice): Goods are prepared physically and the warehouse marks them as "Ready to Ship." Stock has not decreased yet.
6.Delivery Note Created: At this stage, the actual stock of Products will decrease. You will create a StockMovement entry of type SALES_OUT that references this Delivery Note.

## I want to make flow number 4

In the Sidebar Page, it will be named the Invoice module. The page created will be placed at the path "sales/invoice" and read on layout.tsx will contain this data:
const myStaticData = {
module: "sales",
subModule: "invoice",
allowedRole: ["OWNER", "ADMIN"],
data: await getCategories(), // adjust according to the data retrieval
};

### Main Features:

Add Invoice into database

Invoice Form with the following the database column:

### Data Storage:

Save to Invoice
Save details to InvoiceItems

### Example Scenarios:

Admin can create Invoice if PurchaseOrdes status is PROCESSING and StockConfirmationStatus is not WAITING_CONFIRMATION

Make everything complete so that it can CRUD the data.
