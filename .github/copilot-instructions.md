I want to create a CRUD page from this database:

model PurchaseOrders {
id String @id @default(cuid())
poNumber String @unique
poDate DateTime @default(now())
dateline DateTime @default(now())
status PurchaseOrderStatus @default(PENDING)
notes String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// Relasi penting
orderId String @unique // Setiap Order hanya punya satu PO internal
order Orders @relation(fields: [orderId], references: [id])

creatorId String
creator Users @relation("CreatedPurchaseOrders", fields: [creatorId], references: [id])

items PurchaseOrderItems[]

@@map("purchase_orders")
}

model PurchaseOrderItems {
id String @id @default(cuid())
quantity Float

// Relasi penting
purchaseOrderId String
purchaseOrder PurchaseOrders @relation(fields: [purchaseOrderId], references: [id], onDelete: Cascade)

productId String
product Products @relation(fields: [productId], references: [id])

@@map("purchase_order_items")
}

Will reference the folder page "/inventori/produksi"

In the Sidebar Page, it will be named the Daftar PO module. The page created will be placed at the path "sales/daftar-po" and read on layout.tsx will contain this data:
const myStaticData = {
module: "sales",
subModule: "daftar-po",
allowedRole: ["OWNER", "ADMIN"],
data: await getCategories(), // adjust according to the data retrieval
};

Main Features:

Add PO into database

PurchaseOrders Form with the following options:

Type: Purchase Orders
PO Date  
Deadline  
Choose User
Choose Orders data  
Automatically show List of OrderItems that can :

Will show quantity

Data Storage:

Save to PurchaseOrders
Save details to PurchaseOrderItems

Example Scenarios:

Admin only can fill PO Date, Deadline, Choose User, Choose Orders data

Make everything complete so that it can CRUD the data.
