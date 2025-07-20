I want to create a CRUD application from this database:

```prisma
model Categories {
  id          String   @id @default(cuid())
  name        String
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  products    Products[]

  @@map("categories")
}
```

It will be modeled after the "me" folder pages.
In the root path, it will have this component; for full details, refer to `Page.tsx`:

```tsx
<ManagementHeader mainPageName="/me" allowedRoles={["ADMIN"]} />
<ManagementContent
  sampleData={sampleData}
  columns={columns}
  excludedAccessors={excludedAccessors}
/>
```

Where `mainPageName` will be changed to "category," and `allowedRoles` will contain `["ADMIN", "OWNER"]`.

`sampleData` will be fetched from the database using the categories model.
`columns` will contain `name`, `description`, and `isActive`.
`excludedAccessors` will contain `name`, `description`, and `isActive`.

In the "me" folder, there will be a "create" folder that contains a form for entering data. This form will include all the necessary input components to allow data creation on that page. Please also create an "edit" folder for the edit page.

Make everything complete so that CRUD functionality can be performed on the data. Add any other components as needed, but ensure they align with the same theme as the other components.