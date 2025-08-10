import { PrismaClient } from "@prisma/client";
import type { Users, Customers, Invoices, DeliveryNotes } from "@prisma/client";

export async function seedDeliveryNotes(
  prisma: PrismaClient,
  createdUsers: Users[],
  createdCustomers: Customers[],
  createdInvoices: Invoices[]
): Promise<DeliveryNotes[]> {
  console.log("🔄 Seeding Delivery Notes...");

  const warehouseUser = createdUsers.find(user => user.role === "WAREHOUSE");
  if (!warehouseUser) {
    throw new Error("Warehouse user not found");
  }

  // Only create delivery notes for invoices that are PAID and READY_FOR_DELIVERY
  const readyForDeliveryInvoices = createdInvoices.filter(
    invoice =>
      invoice.statusPreparation === "READY_FOR_DELIVERY" &&
      (invoice.paymentStatus === "PAID" || invoice.status === "PAID")
  );

  const deliveryNotesData = [
    {
      code: "DN-2025-001",
      deliveryDate: new Date("2025-01-28"),
      status: "PENDING" as const,
      driverName: "Budi Santoso",
      vehicleNumber: "B 1234 ABC",
      notes: "Pengiriman dalam antrian, menunggu jadwal driver",
      customerId:
        readyForDeliveryInvoices[0]?.customerId || createdCustomers[2].id,
      warehouseUserId: warehouseUser.id,
      invoiceId: readyForDeliveryInvoices[0]?.id || createdInvoices[2].id,
      deliveryAddress: "Jl. Sudirman No. 123, Jakarta Selatan",
      deliveryCity: "Jakarta Selatan",
      deliveryPostalCode: "12190",
    },
    {
      code: "DN-2025-002",
      deliveryDate: new Date("2025-02-02"),
      status: "IN_TRANSIT" as const,
      driverName: "Ahmad Wijaya",
      vehicleNumber: "B 5678 DEF",
      notes: "Barang sedang dalam perjalanan menuju alamat tujuan",
      customerId:
        readyForDeliveryInvoices[1]?.customerId || createdCustomers[3].id,
      warehouseUserId: warehouseUser.id,
      datePreparation: new Date("2025-02-01"),
      notesPreparation: "Barang telah disiapkan dan dimuat ke dalam kendaraan",
      userPreparationId: warehouseUser.id,
      invoiceId: readyForDeliveryInvoices[1]?.id || createdInvoices[3].id,
      deliveryAddress: "Jl. Thamrin No. 456, Jakarta Pusat",
      deliveryCity: "Jakarta Pusat",
      deliveryPostalCode: "10230",
    },
    {
      code: "DN-2025-003",
      deliveryDate: new Date("2025-02-04"),
      status: "DELIVERED" as const,
      driverName: "Slamet Riyadi",
      vehicleNumber: "B 9012 GHI",
      notes: "Pengiriman berhasil diselesaikan, barang diterima dengan baik",
      customerId: createdCustomers[0].id,
      warehouseUserId: warehouseUser.id,
      datePreparation: new Date("2025-02-03"),
      notesPreparation:
        "Barang telah disiapkan dengan baik, dikemas dengan rapi",
      userPreparationId: warehouseUser.id,
      invoiceId: createdInvoices[4].id,
      deliveryAddress: createdCustomers[0].address,
      deliveryCity: createdCustomers[0].city,
      deliveryPostalCode: "12345",
    },
    {
      code: "DN-2025-004",
      deliveryDate: new Date("2025-02-07"),
      status: "CANCELLED" as const,
      driverName: "Joko Susilo",
      vehicleNumber: "B 3456 JKL",
      notes:
        "Pengiriman dibatalkan karena permintaan customer untuk reschedule",
      customerId: createdCustomers[1].id,
      warehouseUserId: warehouseUser.id,
      invoiceId: createdInvoices[5].id,
      deliveryAddress: createdCustomers[1].address,
      deliveryCity: createdCustomers[1].city,
      deliveryPostalCode: "54321",
    },
    {
      code: "DN-2025-005",
      deliveryDate: new Date("2025-02-10"),
      status: "PENDING" as const,
      driverName: "Andi Prasetyo",
      vehicleNumber: "B 7890 MNO",
      notes: "Menunggu konfirmasi alamat pengiriman dari customer",
      customerId: createdCustomers[2].id,
      warehouseUserId: warehouseUser.id,
      datePreparation: new Date("2025-02-09"),
      notesPreparation: "Barang sudah siap, menunggu konfirmasi pengiriman",
      userPreparationId: warehouseUser.id,
      invoiceId: createdInvoices[0].id,
      deliveryAddress: "Jl. Gatot Subroto No. 789, Jakarta Selatan",
      deliveryCity: "Jakarta Selatan",
      deliveryPostalCode: "12930",
    },
  ];

  const createdDeliveryNotes = [];
  for (const dnData of deliveryNotesData) {
    const deliveryNote = await prisma.deliveryNotes.create({
      data: dnData,
    });
    createdDeliveryNotes.push(deliveryNote);
  }

  console.log(`✅ Created ${createdDeliveryNotes.length} Delivery Notes`);
  return createdDeliveryNotes;
}
