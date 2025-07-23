I want to create a CRUD page from this database:

```prisma
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
```

This will be modeled after the folder page "/management/category". This page will be placed at the path "management/product". In `layout.tsx`, it will contain this data:

```
const myStaticData = {
  module: "management",
  subModule: "product",
  allowedRole: ["OWNER", "ADMIN"],
  data: await getCategories(), 
};
```

On the `product/page.tsx` page:
Columns will include `name`, `price`, and `minStock`.  
`excludeAccessors` will contain `name`, `price`, and `minStock`.

Please create everything complete so that I can perform CRUD operations on the data. 