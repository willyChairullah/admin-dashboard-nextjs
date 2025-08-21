I want to create a CRUD page from this database:

## Database

```
model Deliveries {
  id              String         @id @default(cuid())
  deliveryCode     String         @unique
//add more column will need
  status          deliveryStatus  @default(PENDING)
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
Use custom UI from Components/UI

## application flow:

1.Sales Order Created.
2.PO Created.
3.Invoice Created.
4.Make delivery notes if needed 
5.Delivery Created
6.Payment an invoice.

## I want to revisi number 2
### Revisi Features:

Modul Daftar PO:
⦁	Kolom database Net Pembayaran diubah menjadi text saja dan jika bayar langsung akan terisi bayar langsung
⦁	Potongan per item dan Potongan Keseluruhan bisa berupa persen, tambahkan kolom databasenya
⦁	bug dark mode tulisan stok masih berwarna hitam harusnya putih
⦁	input catatan di tinggikan css height nya