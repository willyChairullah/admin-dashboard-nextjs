I want to create a CRUD page from this database:

## Database

```

model Orders {
  id                   String        @id @default(cuid())
  orderNumber          String        @unique
  orderDate            DateTime      @default(now())
  deliveryDate         DateTime?
  status               OrderStatus   @default(NEW)
  totalAmount          Float         @default(0)
  notes                String?
  createdAt            DateTime      @default(now())
  updatedAt            DateTime      @updatedAt
  customerId           String
  salesId              String
  adminNotes           String?
  canceledAt           DateTime?
  completedAt          DateTime?
  confirmedAt          DateTime?
  confirmedBy          String?
  requiresConfirmation Boolean       @default(false)
  deliveryAddress      String
  deliveryCity         String?
  deliveryNotesOrder   String?
  deliveryPostalCode   String?
  discount             Float         @default(0)
  shippingCost         Float         @default(0)
  dueDate              DateTime
  discountType         DiscountType? @default(OVERALL)
  paymentDeadline      DateTime?

  // Fields yang diperlukan untuk form order
  storeId       String?
  paymentType   PaymentType  @default(IMMEDIATE)
  discountUnit  DiscountUnit @default(AMOUNT)
  totalDiscount Float        @default(0)
  subtotal      Float        @default(0)

  purchaseOrders PurchaseOrders[]
  StockMovements StockMovements[]
  salesReturns   SalesReturns[]
  orderItems     OrderItems[]
  sales          Users            @relation(fields: [salesId], references: [id])
  store          Store?           @relation(fields: [storeId], references: [id])
  customer       Customers        @relation(fields: [customerId], references: [id])

  @@map("orders")
}

model OrderItems {
  id         String   @id @default(cuid())
  quantity   Float
  price      Float
  totalPrice Float
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  orderId    String
  productId  String
  discount   Float    @default(0)
  orders     Orders   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  products   Products @relation(fields: [productId], references: [id])

  @@map("order_items")
}

```

## application flow:

1.Sales Order Created.
2.PO Created.
3.Invoice Created.
4.Make delivery notes if needed
5.Delivery Created
6.Payment an invoice.

## I want to make flow number 1
### Revisi Features:

Currently, my application only allows selecting a discount for either Orders or OrderItems, but not both. I want to make it possible to apply discounts to both Orders and OrderItems, and also allow choosing between AMOUNT and PERCENTAGE discount types.

### Data Storage:

Save to Orders and OrderItems

### Example Scenarios:

Sales can enter discounts on orders and order items