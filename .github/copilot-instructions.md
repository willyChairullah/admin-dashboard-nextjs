I want to create a CRUD page from this database:

## Database

```

model DeliveryNotes {
  id                 String            @id @default(cuid())
  deliveryNumber     String            @unique
  deliveryDate       DateTime          @default(now())
  status             DeliveryStatus    @default(PENDING)
  driverName         String
  vehicleNumber      String
  notes              String?
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt
  customerId         String
  orderId            String            @unique
  warehouseUserId    String

  datePreparation    DateTime?
  userPreparationId  String?                                          // <--- ID User Gudang yang mengkonfirmasi kesiapan
  notesPreparation   String?                                          // <--- Catatan dari gudang saat persiapan

  customers          Customers         @relation(fields: [customerId], references: [id])
  orders             Orders            @relation(fields: [orderId], references: [id])
  users              Users             @relation(fields: [warehouseUserId], references: [id]) // Pengguna yang membuat DN
  userPreparation    Users?            @relation("WarehouseConfirmDelivery", fields: [userPreparationId], references: [id]) // <--- Relasi baru

  @@map("delivery_notes")
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

## I want to make flow number 7

In the Sidebar Page, it will be named the "Surat Jalan" module. The page created will be placed at the path "sales/surat-jalan" and read on layout.tsx will contain this data:
const myStaticData = {
module: "sales",
subModule: "surat-jalan",
allowedRole: ["OWNER", "ADMIN"],
data: await getCategories(), // adjust according to the data retrieval
};

### Main Features:

Admin make delivery note from invoice with type PRODUCT, paymentStatus is PAID and statusPreparation is READY_FOR_DELIVERY

### Data Storage:

Save into DeliveryNotes table 

### Example Scenarios:

Admin can choose invoice want to make deliverynotes and save