import { PrismaClient } from "@prisma/client";
import { seedUsers } from "./seeds/seedUsers";
import { seedStores } from "./seeds/seedStores";
import { seedCategoriesAndProducts } from "./seeds/seedCategoriesAndProducts";
import { seedCustomers } from "./seeds/seedCustomers";
import { seedOrders } from "./seeds/seedOrders";
// import { seedPurchaseOrdersInvoicesDeliveryNotes } from "./seeds/seedPurchaseOrdersInvoicesDeliveryNotes";

const prisma = new PrismaClient();

/**
 * Membersihkan database dengan menghapus data dalam urutan yang benar
 * untuk menghindari error foreign key constraint.
 */
async function clearDatabase() {
  console.log("🗑️ Clearing existing data...");

  // Hapus dari model yang memiliki relasi 'child' terlebih dahulu,
  // bergerak ke atas menuju model 'parent'.
  await prisma.userNotifications.deleteMany({});
  await prisma.stockMovements.deleteMany({});
  await prisma.delivery_note_items.deleteMany({});
  await prisma.deliveryNotes.deleteMany({});
  await prisma.payments.deleteMany({});
  await prisma.invoiceItems.deleteMany({});
  await prisma.invoices.deleteMany({});
  await prisma.purchaseOrderItems.deleteMany({});
  await prisma.purchaseOrders.deleteMany({});
  await prisma.orderItems.deleteMany({});
  await prisma.orders.deleteMany({});
  await prisma.customerVisits.deleteMany({});
  await prisma.fieldVisit.deleteMany({});
  await prisma.transactions.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.salesReturnItems.deleteMany({}); // Tambahan jika ada
  await prisma.salesReturns.deleteMany({}); // Tambahan jika ada
  await prisma.products.deleteMany({});
  await prisma.categories.deleteMany({});
  await prisma.customers.deleteMany({});
  await prisma.users.deleteMany({});

  console.log("✅ Database cleared.");
}

/**
 * Fungsi utama untuk menjalankan seluruh proses seeding.
 */
async function main() {
  try {
    console.log("🌱 Starting modular seed process...");

    // 1. Hapus semua data lama dari database
    await clearDatabase();

    // 2. Jalankan seeder untuk data master dan simpan hasilnya jika diperlukan
    const createdUsers = await seedUsers(prisma);
    await seedStores(prisma); // Tidak perlu disimpan jika tidak dipakai seeder lain
    const createdProducts = await seedCategoriesAndProducts(prisma);
    const createdCustomers = await seedCustomers(prisma);

    // 3. Jalankan seeder transaksional yang bergantung pada data master
    const salesUser = createdUsers.find(user => user.role === "SALES");
    if (!salesUser) {
      throw new Error(
        "Sales user role not found after seeding. Seeding cannot continue."
      );
    }

    // Kirim data master yang relevan ke seeder order
    const createdOrders = await seedOrders(
      prisma,
      createdCustomers,
      createdProducts,
      salesUser
    );

    console.log("🎉 Seed process completed successfully!");
  } catch (error) {
    console.error("❌ An error occurred during the seed process:", error);
    process.exit(1);
  } finally {
    // Pastikan koneksi prisma ditutup
    await prisma.$disconnect();
  }
}

// Jalankan fungsi utama
main();
